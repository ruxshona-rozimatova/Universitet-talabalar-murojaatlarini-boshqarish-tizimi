import {
  BarChart3,
  Cloud,
  FileText,
  GraduationCap,
  HardDrive,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import { NavPage } from '../types/appeal';

interface NavigationProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const NAV_ITEMS: { id: NavPage; label: string; mobileLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Asosiy', icon: LayoutDashboard },
  { id: 'appeals', label: 'Murojaatlar', mobileLabel: 'Ro‘yxat', icon: FileText },
  { id: 'new', label: 'Yangi murojaat', mobileLabel: 'Yangi', icon: PlusCircle },
  { id: 'reports', label: 'Hisobotlar', mobileLabel: 'Hisobot', icon: BarChart3 },
  { id: 'settings', label: 'Sozlamalar', mobileLabel: 'Sozlama', icon: Settings },
];

export function Navigation({ activePage, onNavigate }: NavigationProps) {
  const { storageMode, appeals, user, signInWithGoogle } = useAppeals();
  const pendingCount = appeals.filter((a) => a.status !== 'Yakunlandi').length;

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30">
        <div className="px-6 h-16 flex items-center gap-2.5 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            TalabaMurojaat
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Asosiy navigatsiya">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </span>
                {item.id === 'appeals' && pendingCount > 0 && (
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          {storageMode === 'cloud' && user ? (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Cloud className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Firebase Firestore ulangan</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 truncate">
                {user.displayName || user.email}
              </p>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <HardDrive className="w-3.5 h-3.5 shrink-0" />
                <span>Demo rejim (vaqtinchalik)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ma'lumotlar bulutda saqlanishi uchun Firestore'ni ulang.
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Firestore'ni ulash
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar (48px) */}
      <header className="no-print lg:hidden sticky top-0 z-30 h-12 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
          </span>
          <span className="font-display text-sm font-bold text-slate-900">
            TalabaMurojaat
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {storageMode === 'demo' ? (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 whitespace-nowrap"
            >
              Demo · Bulutga ulash
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 whitespace-nowrap"
            >
              Firestore faol
            </button>
          )}
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (56px) */}
      <nav
        aria-label="Mobil navigatsiya"
        className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
                isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[11px] font-medium leading-none whitespace-nowrap">
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
