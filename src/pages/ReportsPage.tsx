import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useAppeals } from '../context/AppealsContext';
import { APPEAL_STATUSES, APPEAL_TYPES, AppealType } from '../types/appeal';
import { exportAppealsToCsv, getStatusBarClass } from '../utils/formatters';

export function ReportsPage() {
  const { appeals, settings, showToast } = useAppeals();
  const [selectedType, setSelectedType] = useState<AppealType | 'Barchasi'>('Barchasi');

  const scopedAppeals = useMemo(() => {
    if (selectedType === 'Barchasi') return appeals;
    return appeals.filter((a) => a.type === selectedType);
  }, [appeals, selectedType]);

  const total = scopedAppeals.length;
  const completedCount = scopedAppeals.filter((a) => a.status === 'Yakunlandi').length;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const activeCount = total - completedCount;

  const uniqueGroups = useMemo(() => {
    const map = new Map<
      string,
      { group: string; total: number; yangi: number; jarayonda: number; yakunlandi: number }
    >();
    scopedAppeals.forEach((item) => {
      const existing = map.get(item.group) ?? {
        group: item.group,
        total: 0,
        yangi: 0,
        jarayonda: 0,
        yakunlandi: 0,
      };
      existing.total += 1;
      if (item.status === 'Yangi') existing.yangi += 1;
      else if (item.status === "Ko'rib chiqilmoqda") existing.jarayonda += 1;
      else existing.yakunlandi += 1;
      map.set(item.group, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [scopedAppeals]);

  const statusBreakdown = APPEAL_STATUSES.map((status) => {
    const count = scopedAppeals.filter((a) => a.status === status).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { status, count, pct };
  });

  const typeBreakdown = APPEAL_TYPES.map((type) => {
    const count = appeals.filter((a) => a.type === type).length;
    const pct = appeals.length > 0 ? Math.round((count / appeals.length) * 100) : 0;
    return { type, count, pct };
  }).sort((a, b) => b.count - a.count);

  const handleDownloadCsv = () => {
    if (scopedAppeals.length === 0) {
      showToast("Hisobotni yuklab olish uchun murojaatlar mavjud emas.", 'info');
      return;
    }
    exportAppealsToCsv(scopedAppeals, 'talaba-hisobot');
    showToast("Hisobot CSV formatida yuklab olindi.", 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {settings.universityName} · {settings.departmentName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Hisobotlar va tahlil
          </h1>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AppealType | 'Barchasi')}
            aria-label="Hisobot turi filtri"
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="Barchasi">Barcha turlar</option>
            {APPEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            CSV yuklash
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Chop etish
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-slate-500">Tanlangan murojaatlar</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {total}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-slate-500">Yakunlash ko'rsatkichi</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
            {completionRate}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-slate-500">Faol jarayonda</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-700">
            {activeCount}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-slate-500">Qamrab olingan guruhlar</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-700">
            {uniqueGroups.length}
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Holat bo'yicha taqsimot</h2>
          <div className="space-y-4">
            {statusBreakdown.map((row) => (
              <div key={row.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{row.status}</span>
                  <span className="font-mono tabular-nums text-xs text-slate-600">
                    {row.count} ta ({row.pct}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStatusBarClass(
                      row.status
                    )}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type Breakdown */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Umumiy turlar kesimida
          </h2>
          <div className="space-y-3.5">
            {typeBreakdown.map((row) => (
              <div key={row.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 truncate pr-2">{row.type}</span>
                  <span className="font-mono tabular-nums text-xs text-slate-600 shrink-0">
                    {row.count} ta ({row.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-800 transition-all duration-300"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Group Statistics Table */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Akademik guruhlar kesimidagi ko'rsatkichlar
          </h2>
        </div>
        {uniqueGroups.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Tanlangan filtr bo'yicha ma'lumotlar topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-4">Guruh</th>
                  <th className="py-3 px-4 text-right">Jami</th>
                  <th className="py-3 px-4 text-right">Yangi</th>
                  <th className="py-3 px-4 text-right">Ko'rib chiqilmoqda</th>
                  <th className="py-3 px-4 text-right">Yakunlandi</th>
                  <th className="py-3 px-4 text-right">Bajarilish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {uniqueGroups.map((g) => {
                  const pct = g.total > 0 ? Math.round((g.yakunlandi / g.total) * 100) : 0;
                  return (
                    <tr key={g.group} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {g.group}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                        {g.total}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700">
                        {g.yangi}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700">
                        {g.jarayonda}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700">
                        {g.yakunlandi}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
