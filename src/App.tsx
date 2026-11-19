import { useState } from 'react';
import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import { AppealDetailModal } from './components/AppealDetailModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navigation } from './components/Navigation';
import { AppealsProvider, useAppeals } from './context/AppealsContext';
import { AppealsPage } from './pages/AppealsPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAppealPage } from './pages/NewAppealPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Appeal, AppealStatus, NavPage } from './types/appeal';

function AppShell() {
  const { toast, dismissToast, appeals } = useAppeals();
  const [activePage, setActivePage] = useState<NavPage>('dashboard');
  const [appealsStatusFilter, setAppealsStatusFilter] = useState<AppealStatus | 'Barchasi'>(
    'Barchasi'
  );
  const [selectedAppealId, setSelectedAppealId] = useState<string | null>(null);

  const selectedAppeal: Appeal | null =
    selectedAppealId ? appeals.find((a) => a.id === selectedAppealId) ?? null : null;

  const handleNavigate = (page: NavPage, initialStatus?: AppealStatus | 'Barchasi') => {
    if (initialStatus) {
      setAppealsStatusFilter(initialStatus);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation activePage={activePage} onNavigate={(page) => handleNavigate(page)} />

      <main className="lg:pl-64 pb-20 lg:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onSelectAppeal={(item) => setSelectedAppealId(item.id)}
            />
          )}
          {activePage === 'appeals' && (
            <AppealsPage
              initialStatusFilter={appealsStatusFilter}
              onNavigate={(p) => handleNavigate(p)}
              onSelectAppeal={(item) => setSelectedAppealId(item.id)}
            />
          )}
          {activePage === 'new' && (
            <NewAppealPage onNavigate={(p) => handleNavigate(p)} />
          )}
          {activePage === 'reports' && <ReportsPage />}
          {activePage === 'settings' && <SettingsPage />}
        </div>
      </main>

      <AppealDetailModal
        appeal={selectedAppeal}
        onClose={() => setSelectedAppealId(null)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-18 lg:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.tone === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {toast.tone === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            {toast.tone === 'info' && (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium leading-snug">{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Bildirishnomani yopish"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppealsProvider>
        <AppShell />
      </AppealsProvider>
    </ErrorBoundary>
  );
}
