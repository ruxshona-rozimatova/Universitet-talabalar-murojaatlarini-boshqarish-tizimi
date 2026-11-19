export type AppealStatus = 'Yangi' | "Ko'rib chiqilmoqda" | 'Yakunlandi';

export type AppealType =
  | 'Akademik masala'
  | 'Stipendiya va moliya'
  | 'Yotoqxona'
  | 'Texnik yordam'
  | "Hujjat va ma'lumotnoma"
  | 'Boshqa';

export type NavPage = 'dashboard' | 'appeals' | 'new' | 'reports' | 'settings';

export type StorageMode = 'demo' | 'cloud';

export interface Appeal {
  id: string;
  studentName: string;
  group: string;
  type: AppealType;
  description: string;
  status: AppealStatus;
  responseNote: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  universityName: string;
  departmentName: string;
  defaultStatusOnCreate: 'Yangi' | "Ko'rib chiqilmoqda";
}

export const APPEAL_STATUSES: AppealStatus[] = [
  'Yangi',
  "Ko'rib chiqilmoqda",
  'Yakunlandi',
];

export const APPEAL_TYPES: AppealType[] = [
  'Akademik masala',
  'Stipendiya va moliya',
  'Yotoqxona',
  'Texnik yordam',
  "Hujjat va ma'lumotnoma",
  'Boshqa',
];

export const SUGGESTED_GROUPS = ['DI-21', 'ATT-304', 'KI-205', 'IQT-102', 'MT-401', 'YX-108'];

// Blueprint volumetric constraints synchronized with firebase-blueprint.json & firestore.rules
export const FIELD_LIMITS = {
  studentNameMin: 2,
  studentNameMax: 100,
  groupMin: 2,
  groupMax: 30,
  descriptionMin: 5,
  descriptionMax: 2000,
  responseNoteMax: 1000,
  universityNameMin: 2,
  universityNameMax: 120,
  departmentNameMin: 2,
  departmentNameMax: 120,
} as const;

export const ADMIN_EMAIL = 'ruxshonarozimatova0@gmail.com';
