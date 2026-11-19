import { ArrowRight, Cloud, HardDrive } from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import { NavPage } from '../types/appeal';

interface StorageNoticeProps {
  onNavigate: (page: NavPage) => void;
}

export function StorageNotice({ onNavigate }: StorageNoticeProps) {
  const { storageMode, signInWithGoogle, cloudReachable } = useAppeals();

  if (storageMode === 'cloud') {
    return null;
  }

  return (
    <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
          <HardDrive className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">
            Demo prototip rejimi — ma'lumotlar vaqtinchalik xotirada saqlanmoqda
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Hozir kiritilgan murojaatlar faqat joriy brauzer sessiyasida ishlaydi va sahifa yangilanganda yo'qoladi. Ma'lumotlarni doimiy saqlash uchun haqiqiy{' '}
            <span className="font-medium text-slate-900">Firebase Firestore</span> bulutli bazasini ulang.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={!cloudReachable}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <Cloud className="w-4 h-4" />
          Firestore'ni ulash
        </button>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          Batafsil
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
