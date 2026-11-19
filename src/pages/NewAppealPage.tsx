import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import {
  APPEAL_TYPES,
  AppealType,
  FIELD_LIMITS,
  NavPage,
  SUGGESTED_GROUPS,
} from '../types/appeal';
import { StorageNotice } from '../components/StorageNotice';

interface NewAppealPageProps {
  onNavigate: (page: NavPage) => void;
}

export function NewAppealPage({ onNavigate }: NewAppealPageProps) {
  const { createAppeal, storageMode } = useAppeals();

  const [studentName, setStudentName] = useState('');
  const [group, setGroup] = useState('');
  const [type, setType] = useState<AppealType>('Akademik masala');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedStudent, setSubmittedStudent] = useState<string | null>(null);

  const handleReset = () => {
    setStudentName('');
    setGroup('');
    setType('Akademik masala');
    setDescription('');
    setErrorMsg('');
    setSubmittedStudent(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = studentName.trim();
    const cleanGroup = group.trim();
    const cleanDesc = description.trim();

    if (cleanName.length < FIELD_LIMITS.studentNameMin) {
      setErrorMsg("Iltimos, talabaning to'liq ism-familiyasini kiriting (kamida 2 belgi).");
      return;
    }
    if (cleanGroup.length < FIELD_LIMITS.groupMin) {
      setErrorMsg("Iltimos, akademik guruh kodini kiriting (masalan: DI-21).");
      return;
    }
    if (cleanDesc.length < FIELD_LIMITS.descriptionMin) {
      setErrorMsg("Batafsil izoh kamida 5 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAppeal({
        studentName: cleanName,
        group: cleanGroup,
        type,
        description: cleanDesc,
      });
      setSubmittedStudent(created.studentName);
      setStudentName('');
      setGroup('');
      setType('Akademik masala');
      setDescription('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Murojaatni saqlashda xatolik yuz berdi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Yangi murojaat qo'shish
        </h1>
        <p className="text-sm text-slate-500">
          Talabaning ism-familiyasi, guruhi, murojaat turi va batafsil mazmunini kiriting.
        </p>
      </div>

      <StorageNotice onNavigate={onNavigate} />

      {submittedStudent && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {submittedStudent}ning murojaati qabul qilindi
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {storageMode === 'cloud'
                  ? "Yozuv Firebase Firestore bulut bazasiga saqlandi."
                  : "Yozuv joriy Demo ro'yxatiga qo'shildi."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('appeals')}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Murojaatlarni ko'rish
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="student-name"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Ism-familiya
            </label>
            <input
              id="student-name"
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              maxLength={FIELD_LIMITS.studentNameMax}
              placeholder="Masalan: Aziza Karimova"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="student-group"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Guruh
            </label>
            <input
              id="student-group"
              type="text"
              required
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              maxLength={FIELD_LIMITS.groupMax}
              placeholder="Masalan: DI-21"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Quick Group Suggestions */}
        <div className="space-y-1.5">
          <span className="block text-xs text-slate-500">Tezkor guruh tanlash:</span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  group.toUpperCase() === g
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="appeal-type"
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            Murojaat turi
          </label>
          <select
            id="appeal-type"
            value={type}
            onChange={(e) => setType(e.target.value as AppealType)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            {APPEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="appeal-description"
              className="block text-sm font-medium text-slate-800"
            >
              Batafsil izoh
            </label>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {description.length} / {FIELD_LIMITS.descriptionMax}
            </span>
          </div>
          <textarea
            id="appeal-description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={FIELD_LIMITS.descriptionMax}
            placeholder="Murojaat sababi, sana, fan yoki tegishli tafsilotlarni yozing..."
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Formani tozalash
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Yuborilmoqda...' : 'Murojaatni yuborish'}
          </button>
        </div>
      </form>
    </div>
  );
}
