import { FormEvent, useEffect, useState } from 'react';
import {
  Check,
  Cloud,
  Database,
  HardDrive,
  LogOut,
  RotateCcw,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import { FIELD_LIMITS } from '../types/appeal';

export function SettingsPage() {
  const {
    user,
    isAdmin,
    storageMode,
    cloudReachable,
    settings,
    appeals,
    projectInfo,
    signInWithGoogle,
    signOutUser,
    saveSettings,
    importDemoToCloud,
    resetDemoData,
    clearDemoData,
  } = useAppeals();

  const [universityName, setUniversityName] = useState(settings.universityName);
  const [departmentName, setDepartmentName] = useState(settings.departmentName);
  const [defaultStatusOnCreate, setDefaultStatusOnCreate] = useState<'Yangi' | "Ko'rib chiqilmoqda">(
    settings.defaultStatusOnCreate
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setUniversityName(settings.universityName);
    setDepartmentName(settings.departmentName);
    setDefaultStatusOnCreate(settings.defaultStatusOnCreate);
  }, [settings]);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (universityName.trim().length < FIELD_LIMITS.universityNameMin) {
      setFormError("Universitet nomi kamida 2 ta belgi bo'lishi kerak.");
      return;
    }
    if (departmentName.trim().length < FIELD_LIMITS.departmentNameMin) {
      setFormError("Bo'lim nomi kamida 2 ta belgi bo'lishi kerak.");
      return;
    }

    setSavingSettings(true);
    try {
      await saveSettings({
        universityName,
        departmentName,
        defaultStatusOnCreate,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Saqlashda xatolik yuz berdi.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleMigrateDemo = async () => {
    setMigrating(true);
    try {
      await importDemoToCloud();
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sozlamalar</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Ma'lumotlarni saqlash muhiti, Firebase Firestore bulut ulanishi va universitet ma'lumotlari.
        </p>
      </div>

      {/* Cloud Storage & Firebase Firestore Integration Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                storageMode === 'cloud'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {storageMode === 'cloud' ? (
                <Cloud className="w-5 h-5" />
              ) : (
                <HardDrive className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {storageMode === 'cloud'
                  ? 'Firebase Firestore bulutli saqlash faol'
                  : 'Demo rejim (vaqtinchalik xotira)'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {storageMode === 'cloud'
                  ? "Barcha talaba murojaatlari va bo'lim sozlamalari real vaqt rejimida Firebase Firestore bazasida doimiy saqlanmoqda."
                  : "Demo prototipdagi ma'lumotlar faqat vaqtinchalik xotirada turadi. Ma'lumotlar yo'qolib ketmasligi va barcha qurilmalarda sinxron ishlashi uchun haqiqiy Firebase Firestore bulutli saqlashni ulash zarur."}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Connection Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Saqlash holati</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">
              {storageMode === 'cloud' ? 'Bulutli (Doimiy)' : 'Vaqtinchalik (Demo)'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Firebase loyiha</span>
            <span className="font-mono text-slate-900 mt-0.5 block truncate">
              {projectInfo.projectId}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Tarmoq va xizmat</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">
              {cloudReachable ? 'Firestore tayyor' : 'Oflayn holat'}
            </span>
          </div>
        </div>

        {storageMode === 'cloud' && user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.displayName || 'Foydalanuvchi'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email} · {isAdmin ? 'Administrator huquqi' : 'Mas’ul xodim'}
                </p>
              </div>
              <button
                type="button"
                onClick={signOutUser}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                Hisobdan chiqish
              </button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-slate-900">
                  Demo murojaatlarni bulutga ko'chirish
                </h3>
                <p className="text-xs text-slate-600">
                  Agar Firestore bazangiz bo'sh bo'lsa, 8 ta namunaviy talaba murojaatini bir klikda bulutga yuklashingiz mumkin ({appeals.length} ta joriy yozuv).
                </p>
              </div>
              <button
                type="button"
                onClick={handleMigrateDemo}
                disabled={migrating}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                <UploadCloud className="w-4 h-4" />
                {migrating ? 'Yuklanmoqda...' : "Namunalarni Firestore'ga yuklash"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!cloudReachable}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              <Database className="w-4 h-4" />
              Google bilan kirish va Firestore'ni ulash
            </button>
            <button
              type="button"
              onClick={resetDemoData}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Demo ma'lumotlarni tiklash
            </button>
            <button
              type="button"
              onClick={clearDemoData}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Demo ro'yxatni tozalash
            </button>
          </div>
        )}
      </section>

      {/* University & Department Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Universitet va bo'lim ma'lumotlari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ushbu ma'lumotlar boshqaruv paneli va chop etiladigan hisobot sarlavhalarida ko'rinadi.
          </p>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="university-name"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Universitet nomi
            </label>
            <input
              id="university-name"
              type="text"
              required
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              maxLength={FIELD_LIMITS.universityNameMax}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="department-name"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Mas'ul bo'lim / Dekanat
            </label>
            <input
              id="department-name"
              type="text"
              required
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              maxLength={FIELD_LIMITS.departmentNameMax}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="default-status"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Yangi murojaat yaratilgandagi birlamchi holat
            </label>
            <select
              id="default-status"
              value={defaultStatusOnCreate}
              onChange={(e) =>
                setDefaultStatusOnCreate(
                  e.target.value === "Ko'rib chiqilmoqda" ? "Ko'rib chiqilmoqda" : 'Yangi'
                )
              }
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="Yangi">Yangi</option>
              <option value="Ko'rib chiqilmoqda">Ko'rib chiqilmoqda</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            {savingSettings ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
