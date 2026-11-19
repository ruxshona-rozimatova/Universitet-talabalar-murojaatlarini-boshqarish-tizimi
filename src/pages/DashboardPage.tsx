import { ArrowRight, Plus } from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import { APPEAL_TYPES, Appeal, AppealStatus, NavPage } from '../types/appeal';
import { formatDateShort, getStatusTextClass } from '../utils/formatters';
import { StorageNotice } from '../components/StorageNotice';

interface DashboardPageProps {
  onNavigate: (page: NavPage, initialStatus?: AppealStatus | 'Barchasi') => void;
  onSelectAppeal: (appeal: Appeal) => void;
}

export function DashboardPage({ onNavigate, onSelectAppeal }: DashboardPageProps) {
  const { appeals, settings, loading, updateAppeal } = useAppeals();

  const totalCount = appeals.length;
  const newCount = appeals.filter((a) => a.status === 'Yangi').length;
  const inProgressCount = appeals.filter((a) => a.status === "Ko'rib chiqilmoqda").length;
  const completedCount = appeals.filter((a) => a.status === 'Yakunlandi').length;

  const recentAppeals = appeals.slice(0, 5);

  const typeCounts = APPEAL_TYPES.map((t) => ({
    type: t,
    count: appeals.filter((a) => a.type === t).length,
  })).sort((a, b) => b.count - a.count);

  const kpiItems: {
    label: string;
    value: number;
    filter: AppealStatus | 'Barchasi';
    tone: string;
  }[] = [
    { label: 'Jami murojaatlar', value: totalCount, filter: 'Barchasi', tone: 'text-slate-900' },
    { label: 'Yangi', value: newCount, filter: 'Yangi', tone: 'text-blue-700' },
    {
      label: "Ko'rib chiqilmoqda",
      value: inProgressCount,
      filter: "Ko'rib chiqilmoqda",
      tone: 'text-amber-700',
    },
    { label: 'Yakunlandi', value: completedCount, filter: 'Yakunlandi', tone: 'text-emerald-700' },
  ];

  const handleQuickNextStatus = (e: React.MouseEvent, item: Appeal) => {
    e.stopPropagation();
    const next: AppealStatus =
      item.status === 'Yangi'
        ? "Ko'rib chiqilmoqda"
        : item.status === "Ko'rib chiqilmoqda"
          ? 'Yakunlandi'
          : 'Yakunlandi';
    if (item.status !== 'Yakunlandi') {
      updateAppeal(item.id, { status: next });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">
            {settings.universityName} · {settings.departmentName}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Murojaatlar boshqaruv paneli
          </h1>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('appeals', 'Barchasi')}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Barchasini ko'rish
          </button>
          <button
            type="button"
            onClick={() => onNavigate('new')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Yangi murojaat
          </button>
        </div>
      </div>

      {/* Temporary Demo vs Cloud Notice */}
      <StorageNotice onNavigate={(p) => onNavigate(p)} />

      {/* 4-column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiItems.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onNavigate('appeals', kpi.filter)}
            className="text-left bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{kpi.label}</p>
            <p className={`mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums ${kpi.tone}`}>
              {loading ? '—' : kpi.value}
            </p>
          </button>
        ))}
      </div>

      {/* Two-Column Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Appeals */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-900">So'nggi murojaatlar</h2>
            <button
              type="button"
              onClick={() => onNavigate('appeals', 'Barchasi')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              Ro'yxatga o'tish
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentAppeals.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Hozircha murojaatlar mavjud emas
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Yangi talaba murojaatini qo'shing yoki Sozlamalar sahifasidan demo namunalarni yuklang.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('new')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Birinchi murojaatni qo'shish
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Sozlamalarga o'tish
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppeals.map((item) => {
                const canAdvance = item.status !== 'Yakunlandi';

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectAppeal(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectAppeal(item);
                      }
                    }}
                    className="px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {item.studentName}
                        </span>
                        <span className="text-xs text-slate-400" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs font-mono text-slate-600">{item.group}</span>
                        <span className="text-xs text-slate-400" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-slate-500">{item.type}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        {formatDateShort(item.createdAt)}
                      </span>
                      <span className={`text-xs whitespace-nowrap ${getStatusTextClass(item.status)}`}>
                        {item.status}
                      </span>
                      {canAdvance && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickNextStatus(e, item)}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
                        >
                          {item.status === 'Yangi' ? "Ko'rib chiqish" : 'Yakunlash'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Summary Column */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Murojaat turlari</h2>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
              >
                Hisobotlar
              </button>
            </div>
            <div className="space-y-3">
              {typeCounts.map((row) => {
                const pct = totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;
                return (
                  <div key={row.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate pr-2">{row.type}</span>
                      <span className="font-mono tabular-nums text-slate-500 shrink-0">
                        {row.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Tezkor amallar</h2>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onNavigate('new')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Yangi murojaat kiritish</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Oylik hisobotni ko'rish</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Bulutli saqlash sozlamalari</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
