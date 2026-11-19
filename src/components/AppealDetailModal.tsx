import { useEffect, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import {
  APPEAL_STATUSES,
  APPEAL_TYPES,
  Appeal,
  AppealStatus,
  AppealType,
  FIELD_LIMITS,
} from '../types/appeal';
import { formatDateTime, getStatusTextClass } from '../utils/formatters';

interface AppealDetailModalProps {
  appeal: Appeal | null;
  onClose: () => void;
}

export function AppealDetailModal({ appeal, onClose }: AppealDetailModalProps) {
  const { updateAppeal, deleteAppeal, storageMode, isAdmin } = useAppeals();
  const [status, setStatus] = useState<AppealStatus>('Yangi');
  const [responseNote, setResponseNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [group, setGroup] = useState('');
  const [type, setType] = useState<AppealType>('Akademik masala');
  const [description, setDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!appeal) return;
    setStatus(appeal.status);
    setResponseNote(appeal.responseNote);
    setStudentName(appeal.studentName);
    setGroup(appeal.group);
    setType(appeal.type);
    setDescription(appeal.description);
    setIsEditing(false);
    setConfirmDelete(false);
    setErrorMsg('');
  }, [appeal]);

  if (!appeal) return null;

  const isLockedInCloud =
    storageMode === 'cloud' && appeal.status === 'Yakunlandi' && !isAdmin;

  const handleSave = async () => {
    setErrorMsg('');
    if (isEditing) {
      if (studentName.trim().length < FIELD_LIMITS.studentNameMin) {
        setErrorMsg("Talaba ism-familiyasi kamida 2 ta belgi bo'lishi kerak.");
        return;
      }
      if (group.trim().length < FIELD_LIMITS.groupMin) {
        setErrorMsg("Guruh nomi kamida 2 ta belgi bo'lishi kerak.");
        return;
      }
      if (description.trim().length < FIELD_LIMITS.descriptionMin) {
        setErrorMsg("Batafsil izoh kamida 5 ta belgi bo'lishi kerak.");
        return;
      }
    }

    setSaving(true);
    try {
      await updateAppeal(appeal.id, {
        status,
        responseNote,
        ...(isEditing
          ? {
              studentName,
              group,
              type,
              description,
            }
          : {}),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteAppeal(appeal.id);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "O'chirishda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appeal-modal-title"
    >
      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Drag handle for mobile bottom sheet feel */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="appeal-modal-title"
              className="text-base sm:text-lg font-semibold text-slate-900 truncate"
            >
              {appeal.studentName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="font-mono">{appeal.group}</span>
              <span aria-hidden="true">·</span>
              <span>{appeal.type}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatDateTime(appeal.createdAt)}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isLockedInCloud && (
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Murojaatni tahrirlash"
                aria-label="Murojaatni tahrirlash"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Ism-familiya
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    maxLength={FIELD_LIMITS.studentNameMax}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Guruh
                  </label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    maxLength={FIELD_LIMITS.groupMax}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Murojaat turi
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AppealType)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {APPEAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Batafsil izoh
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={FIELD_LIMITS.descriptionMax}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Murojaat mazmuni</span>
                <span className={getStatusTextClass(appeal.status)}>{appeal.status}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {appeal.description}
              </div>
            </div>
          )}

          {/* Status selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Ko'rib chiqish holatini belgilash
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {APPEAL_STATUSES.map((st) => {
                const active = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={isLockedInCloud}
                    onClick={() => setStatus(st)}
                    className={`min-h-[40px] px-2 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap truncate ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    } disabled:opacity-50`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
            {isLockedInCloud && (
              <p className="text-xs text-slate-500">
                Ushbu murojaat yakunlangan. Uni qayta ochish faqat administrator ruxsati bilan bajariladi.
              </p>
            )}
          </div>

          {/* Response note */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Mas'ul xodim javobi yoki izohi
            </label>
            <textarea
              rows={3}
              value={responseNote}
              disabled={isLockedInCloud}
              onChange={(e) => setResponseNote(e.target.value)}
              maxLength={FIELD_LIMITS.responseNoteMax}
              placeholder="Talaba murojaati bo'yicha ko'rilgan chora yoki javob matnini kiriting..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Ha, o'chirish
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Bekor qilish
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              O'chirish
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Yopish
            </button>
            {!isLockedInCloud && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
