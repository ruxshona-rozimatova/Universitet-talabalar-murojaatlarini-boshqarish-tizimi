import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  firebaseProjectInfo,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../firebase/config';
import { DEFAULT_SETTINGS, INITIAL_DEMO_APPEALS } from '../data/demoAppeals';
import {
  ADMIN_EMAIL,
  Appeal,
  AppealStatus,
  AppealType,
  FIELD_LIMITS,
  StorageMode,
  WorkspaceSettings,
} from '../types/appeal';
import { sanitizeAppealInput } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'error' | 'info';
}

interface NewAppealPayload {
  studentName: string;
  group: string;
  type: AppealType;
  description: string;
}

interface UpdateAppealPayload {
  studentName?: string;
  group?: string;
  type?: AppealType;
  description?: string;
  status?: AppealStatus;
  responseNote?: string;
}

interface AppealsContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  storageMode: StorageMode;
  cloudReachable: boolean;
  loading: boolean;
  appeals: Appeal[];
  settings: WorkspaceSettings;
  toast: ToastMessage | null;
  dismissToast: () => void;
  showToast: (text: string, tone?: ToastMessage['tone']) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  createAppeal: (payload: NewAppealPayload) => Promise<Appeal>;
  updateAppeal: (id: string, patch: UpdateAppealPayload) => Promise<void>;
  deleteAppeal: (id: string) => Promise<void>;
  saveSettings: (next: WorkspaceSettings) => Promise<void>;
  importDemoToCloud: () => Promise<number>;
  resetDemoData: () => void;
  clearDemoData: () => void;
  projectInfo: typeof firebaseProjectInfo;
}

const AppealsContext = createContext<AppealsContextValue | null>(null);

function parseFirestoreDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

export function AppealsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudReachable, setCloudReachable] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [demoAppeals, setDemoAppeals] = useState<Appeal[]>(() => INITIAL_DEMO_APPEALS);
  const [cloudAppeals, setCloudAppeals] = useState<Appeal[]>([]);
  const [demoSettings, setDemoSettings] = useState<WorkspaceSettings>(DEFAULT_SETTINGS);
  const [cloudSettings, setCloudSettings] = useState<WorkspaceSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToast({ id, text, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    testConnection().then((res) => {
      setCloudReachable(!res.offline);
    });
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAdmin = Boolean(user?.email === ADMIN_EMAIL && user?.emailVerified);
  const storageMode: StorageMode = user ? 'cloud' : 'demo';

  // Real-time Firestore subscription when signed in
  useEffect(() => {
    if (!authReady || !user) {
      setCloudAppeals([]);
      setCloudLoading(false);
      return;
    }

    setCloudLoading(true);
    const appealsPath = 'appeals';
    const appealsQuery = isAdmin
      ? collection(db, appealsPath)
      : query(collection(db, appealsPath), where('ownerId', '==', user.uid));

    const unsubAppeals = onSnapshot(
      appealsQuery,
      (snapshot) => {
        const items: Appeal[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            studentName: String(data.studentName ?? ''),
            group: String(data.group ?? ''),
            type: (data.type as AppealType) ?? 'Boshqa',
            description: String(data.description ?? ''),
            status: (data.status as AppealStatus) ?? 'Yangi',
            responseNote: String(data.responseNote ?? ''),
            ownerId: String(data.ownerId ?? ''),
            createdAt: parseFirestoreDate(data.createdAt),
            updatedAt: parseFirestoreDate(data.updatedAt),
          };
        });
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setCloudAppeals(items);
        setCloudLoading(false);
      },
      (error) => {
        setCloudLoading(false);
        handleFirestoreError(error, OperationType.LIST, appealsPath);
      }
    );

    const settingsPath = `settings/${user.uid}`;
    const unsubSettings = onSnapshot(
      doc(db, 'settings', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCloudSettings({
            universityName: String(data.universityName ?? DEFAULT_SETTINGS.universityName),
            departmentName: String(data.departmentName ?? DEFAULT_SETTINGS.departmentName),
            defaultStatusOnCreate:
              data.defaultStatusOnCreate === "Ko'rib chiqilmoqda"
                ? "Ko'rib chiqilmoqda"
                : 'Yangi',
          });
        } else {
          setCloudSettings(DEFAULT_SETTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      }
    );

    return () => {
      unsubAppeals();
      unsubSettings();
    };
  }, [authReady, user, isAdmin]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Firebase Firestore bulutli saqlash muvaffaqiyatli ulandi.", 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Kirishda xatolik yuz berdi";
      showToast(`Google orqali kirishda xatolik: ${msg}`, 'error');
    }
  }, [showToast]);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      showToast("Hisobdan chiqildi. Ilova Demo rejimiga o'tdi.", 'info');
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Chiqishda xatolik";
      showToast(msg, 'error');
    }
  }, [showToast]);

  const activeSettings = storageMode === 'cloud' ? cloudSettings : demoSettings;

  const createAppeal = useCallback(
    async (payload: NewAppealPayload): Promise<Appeal> => {
      const sanitized = sanitizeAppealInput({
        studentName: payload.studentName,
        group: payload.group,
        description: payload.description,
      });

      if (sanitized.studentName.length < FIELD_LIMITS.studentNameMin) {
        throw new Error("Talaba ism-familiyasi kamida 2 ta belgidan iborat bo'lishi kerak.");
      }
      if (sanitized.group.length < FIELD_LIMITS.groupMin) {
        throw new Error("Guruh nomi kamida 2 ta belgidan iborat bo'lishi kerak.");
      }
      if (sanitized.description.length < FIELD_LIMITS.descriptionMin) {
        throw new Error("Batafsil izoh kamida 5 ta belgidan iborat bo'lishi kerak.");
      }

      const initialStatus: AppealStatus = activeSettings.defaultStatusOnCreate;

      if (storageMode === 'demo' || !user) {
        const nowDate = new Date();
        const created: Appeal = {
          id: `demo-${Date.now().toString(36)}`,
          studentName: sanitized.studentName,
          group: sanitized.group,
          type: payload.type,
          description: sanitized.description,
          status: initialStatus,
          responseNote: '',
          ownerId: 'demo-user',
          createdAt: nowDate,
          updatedAt: nowDate,
        };
        setDemoAppeals((prev) => [created, ...prev]);
        showToast("Murojaat Demo xotiraga qo'shildi.", 'success');
        return created;
      }

      const newRef = doc(collection(db, 'appeals'));
      const path = `appeals/${newRef.id}`;
      try {
        await setDoc(newRef, {
          studentName: sanitized.studentName,
          group: sanitized.group,
          type: payload.type,
          description: sanitized.description,
          status: initialStatus,
          responseNote: '',
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast("Murojaat Firebase Firestore bulutiga saqlandi.", 'success');
        const nowDate = new Date();
        return {
          id: newRef.id,
          studentName: sanitized.studentName,
          group: sanitized.group,
          type: payload.type,
          description: sanitized.description,
          status: initialStatus,
          responseNote: '',
          ownerId: user.uid,
          createdAt: nowDate,
          updatedAt: nowDate,
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [activeSettings.defaultStatusOnCreate, storageMode, user, showToast]
  );

  const updateAppeal = useCallback(
    async (id: string, patch: UpdateAppealPayload) => {
      if (storageMode === 'demo' || !user) {
        setDemoAppeals((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;
            const nextSanitized = sanitizeAppealInput({
              studentName: patch.studentName ?? item.studentName,
              group: patch.group ?? item.group,
              description: patch.description ?? item.description,
              responseNote: patch.responseNote ?? item.responseNote,
            });
            return {
              ...item,
              studentName: nextSanitized.studentName,
              group: nextSanitized.group,
              type: patch.type ?? item.type,
              description: nextSanitized.description,
              status: patch.status ?? item.status,
              responseNote: nextSanitized.responseNote,
              updatedAt: new Date(),
            };
          })
        );
        showToast("Murojaat holati yangilandi (Demo).", 'success');
        return;
      }

      const target = cloudAppeals.find((a) => a.id === id);
      if (target && target.status === 'Yakunlandi' && !isAdmin) {
        showToast(
          "Yakunlangan murojaatni faqat administrator tahrirlashi mumkin.",
          'info'
        );
        return;
      }

      const path = `appeals/${id}`;
      const updateBody: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (patch.studentName !== undefined) {
        updateBody.studentName = patch.studentName.trim().slice(0, FIELD_LIMITS.studentNameMax);
      }
      if (patch.group !== undefined) {
        updateBody.group = patch.group.trim().toUpperCase().slice(0, FIELD_LIMITS.groupMax);
      }
      if (patch.type !== undefined) {
        updateBody.type = patch.type;
      }
      if (patch.description !== undefined) {
        updateBody.description = patch.description.trim().slice(0, FIELD_LIMITS.descriptionMax);
      }
      if (patch.status !== undefined) {
        updateBody.status = patch.status;
      }
      if (patch.responseNote !== undefined) {
        updateBody.responseNote = patch.responseNote.trim().slice(0, FIELD_LIMITS.responseNoteMax);
      }

      try {
        await updateDoc(doc(db, 'appeals', id), updateBody);
        showToast("Murojaat ma'lumotlari Firestore'da yangilandi.", 'success');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [storageMode, user, cloudAppeals, isAdmin, showToast]
  );

  const deleteAppeal = useCallback(
    async (id: string) => {
      if (storageMode === 'demo' || !user) {
        setDemoAppeals((prev) => prev.filter((item) => item.id !== id));
        showToast("Murojaat ro'yxatdan o'chirildi (Demo).", 'info');
        return;
      }

      const path = `appeals/${id}`;
      try {
        await deleteDoc(doc(db, 'appeals', id));
        showToast("Murojaat Firestore'dan o'chirildi.", 'info');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [storageMode, user, showToast]
  );

  const saveSettings = useCallback(
    async (next: WorkspaceSettings) => {
      const cleaned: WorkspaceSettings = {
        universityName:
          next.universityName.trim().slice(0, FIELD_LIMITS.universityNameMax) ||
          DEFAULT_SETTINGS.universityName,
        departmentName:
          next.departmentName.trim().slice(0, FIELD_LIMITS.departmentNameMax) ||
          DEFAULT_SETTINGS.departmentName,
        defaultStatusOnCreate: next.defaultStatusOnCreate,
      };

      if (cleaned.universityName.length < FIELD_LIMITS.universityNameMin) {
        throw new Error("Universitet nomi kamida 2 ta belgidan iborat bo'lishi kerak.");
      }
      if (cleaned.departmentName.length < FIELD_LIMITS.departmentNameMin) {
        throw new Error("Bo'lim nomi kamida 2 ta belgidan iborat bo'lishi kerak.");
      }

      if (storageMode === 'demo' || !user) {
        setDemoSettings(cleaned);
        showToast("Sozlamalar joriy sessiya uchun saqlandi (Demo).", 'success');
        return;
      }

      const path = `settings/${user.uid}`;
      try {
        await setDoc(doc(db, 'settings', user.uid), {
          universityName: cleaned.universityName,
          departmentName: cleaned.departmentName,
          defaultStatusOnCreate: cleaned.defaultStatusOnCreate,
          ownerId: user.uid,
          updatedAt: serverTimestamp(),
        });
        showToast("Sozlamalar Firebase Firestore'ga saqlandi.", 'success');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [storageMode, user, showToast]
  );

  const importDemoToCloud = useCallback(async (): Promise<number> => {
    if (!user) {
      throw new Error("Avval Google hisobingiz bilan kiring.");
    }
    const sourceItems = demoAppeals.length > 0 ? demoAppeals : INITIAL_DEMO_APPEALS;
    const batch = writeBatch(db);
    sourceItems.forEach((item) => {
      const ref = doc(collection(db, 'appeals'));
      const sanitized = sanitizeAppealInput({
        studentName: item.studentName,
        group: item.group,
        description: item.description,
        responseNote: item.responseNote,
      });
      batch.set(ref, {
        studentName: sanitized.studentName,
        group: sanitized.group,
        type: item.type,
        description: sanitized.description,
        status: item.status,
        responseNote: sanitized.responseNote,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await batch.commit();
      showToast(
        `${sourceItems.length} ta demo murojaat Firebase Firestore bulutiga ko'chirildi.`,
        'success'
      );
      return sourceItems.length;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appeals');
    }
  }, [user, demoAppeals, showToast]);

  const resetDemoData = useCallback(() => {
    setDemoAppeals(INITIAL_DEMO_APPEALS);
    setDemoSettings(DEFAULT_SETTINGS);
    showToast("Demo ma'lumotlar boshlang'ich holatga qaytarildi.", 'info');
  }, [showToast]);

  const clearDemoData = useCallback(() => {
    setDemoAppeals([]);
    showToast("Demo ro'yxati tozalandi.", 'info');
  }, [showToast]);

  const appeals = storageMode === 'cloud' ? cloudAppeals : demoAppeals;

  const value = useMemo<AppealsContextValue>(
    () => ({
      user,
      authReady,
      isAdmin,
      storageMode,
      cloudReachable,
      loading: !authReady || (storageMode === 'cloud' && cloudLoading),
      appeals,
      settings: activeSettings,
      toast,
      dismissToast,
      showToast,
      signInWithGoogle,
      signOutUser,
      createAppeal,
      updateAppeal,
      deleteAppeal,
      saveSettings,
      importDemoToCloud,
      resetDemoData,
      clearDemoData,
      projectInfo: firebaseProjectInfo,
    }),
    [
      user,
      authReady,
      isAdmin,
      storageMode,
      cloudReachable,
      cloudLoading,
      appeals,
      activeSettings,
      toast,
      dismissToast,
      showToast,
      signInWithGoogle,
      signOutUser,
      createAppeal,
      updateAppeal,
      deleteAppeal,
      saveSettings,
      importDemoToCloud,
      resetDemoData,
      clearDemoData,
    ]
  );

  return <AppealsContext.Provider value={value}>{children}</AppealsContext.Provider>;
}

export function useAppeals() {
  const ctx = useContext(AppealsContext);
  if (!ctx) {
    throw new Error('useAppeals must be used inside AppealsProvider');
  }
  return ctx;
}
