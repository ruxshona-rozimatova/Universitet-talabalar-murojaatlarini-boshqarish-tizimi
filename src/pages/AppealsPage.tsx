import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import {
  APPEAL_STATUSES,
  APPEAL_TYPES,
  Appeal,
  AppealStatus,
  AppealType,
  NavPage,
} from '../types/appeal';
import {
  exportAppealsToCsv,
  formatDateShort,
  getStatusTextClass,
} from '../utils/formatters';

interface AppealsPageProps {
  initialStatusFilter?: AppealStatus | 'Barchasi';
  onNavigate: (page: NavPage) => void;
  onSelectAppeal: (appeal: Appeal) => void;
}

type SortOrder = 'newest' | 'oldest' | 'name';

export function AppealsPage({
  initialStatusFilter = 'Barchasi',
  onNavigate,
  onSelectAppeal,
}: AppealsPageProps) {
  const {
    appeals,
    loading,
    updateAppeal,
    storageMode,
    isAdmin,
    resetDemoData,
    showToast,
  } = useAppeals();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppealStatus | 'Barchasi'>(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState<AppealType | 'Barchasi'>('Barchasi');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const filteredAppeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = appeals.filter((item) => {
      const matchesStatus = statusFilter === 'Barchasi' || item.status === statusFilter;
      const matchesType = typeFilter === 'Barchasi' || item.type === typeFilter;
      const matchesQuery =
        q.length === 0 ||
        item.studentName.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesStatus && matchesType && matchesQuery;
    });

    const sorted = [...list];
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortOrder === 'oldest') {
      sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else {
      sorted.sort((a, b) => a.studentName.localeCompare(b.studentName, 'uz'));
    }
    return sorted;
  }, [appeals, searchQuery, statusFilter, typeFilter, sortOrder]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'Barchasi' || typeFilter !== 'Barchasi';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('Barchasi');
    setTypeFilter('Barchasi');
  };

  const handleStatusChange = async (item: Appeal, nextStatus: AppealStatus) => {
    if (item.status === nextStatus) return;
    await updateAppeal(item.id, { status: nextStatus });
  };

  const handleExport = () => {
    if (filteredAppeals.length === 0) {
      showToast("Eksport qilish uchun murojaat topilmadi.", 'info');
      return;
    }
    exportAppealsToCsv(filteredAppeals);
    showToast(`${filteredAppeals.length} ta murojaat CSV fayliga yuklandi.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Murojaatlar</h1>
          <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
            Ko'rsatilmoqda: {filteredAppeals.length} / {appeals.length} ta murojaat
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            CSV yuklash
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

      {/* Search & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Talaba, guruh yoki izoh bo'yicha qidirish..."
              aria-label="Murojaatlarni qidirish"
              className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Qidiruvni tozalash"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Select */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AppealType | 'Barchasi')}
              aria-label="Murojaat turi bo'yicha filtr"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="Barchasi">Barcha turlar</option>
              {APPEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              aria-label="Saralash tartibi"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="newest">Eng yangi avval</option>
              <option value="oldest">Eng eski avval</option>
              <option value="name">Talaba ismi (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Segmented Tabs + Clear Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['Barchasi', ...APPEAL_STATUSES] as const).map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Filtrlarni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Data Table (Desktop md+) & Cards (Mobile) */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredAppeals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            {hasActiveFilters
              ? "Qidiruv va filtr bo'yicha murojaat topilmadi"
              : "Murojaatlar ro'yxati bo'sh"}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {hasActiveFilters
              ? "Boshqa kalit so'z kiriting yoki filtrlarni tozalab qayta urinib ko'ring."
              : "Yangi murojaat qo'shing yoki demo namunalarni qayta tiklang."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Filtrlarni tozalash
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('new')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  + Yangi murojaat
                </button>
                {storageMode === 'demo' && (
                  <button
                    type="button"
                    onClick={resetDemoData}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Demo namunalarni yuklash
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                    <th className="py-3.5 px-4 whitespace-nowrap">Sana</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Talaba</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Guruh</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Turi</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Holati</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAppeals.map((item) => {
                    const locked =
                      storageMode === 'cloud' && item.status === 'Yakunlandi' && !isAdmin;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectAppeal(item)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-slate-500 whitespace-nowrap">
                          {formatDateShort(item.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900">{item.studentName}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                            {item.description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {item.group}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {item.type}
                        </td>
                        <td
                          className="py-3.5 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={item.status}
                            disabled={locked}
                            aria-label={`${item.studentName} murojaat holati`}
                            onChange={(e) =>
                              handleStatusChange(item, e.target.value as AppealStatus)
                            }
                            className={`text-xs bg-transparent border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-70 ${getStatusTextClass(
                              item.status
                            )}`}
                          >
                            {APPEAL_STATUSES.map((st) => (
                              <option key={st} value={st} className="text-slate-900 font-normal">
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          className="py-3.5 px-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectAppeal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ko'rish
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredAppeals.map((item) => {
              const locked =
                storageMode === 'cloud' && item.status === 'Yakunlandi' && !isAdmin;
              return (
                <article
                  key={item.id}
                  onClick={() => onSelectAppeal(item)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {item.studentName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-slate-700">{item.group}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatDateShort(item.createdAt)}
                        </span>
                      </p>
                    </div>
                    <span className={`text-xs shrink-0 ${getStatusTextClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div
                    className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={item.status}
                      disabled={locked}
                      aria-label={`${item.studentName} holatini o'zgartirish`}
                      onChange={(e) =>
                        handleStatusChange(item, e.target.value as AppealStatus)
                      }
                      className="min-h-[44px] flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
                    >
                      {APPEAL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onSelectAppeal(item)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 whitespace-nowrap"
                    >
                      Batafsil
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
