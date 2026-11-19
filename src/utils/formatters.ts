import { Appeal, AppealStatus, FIELD_LIMITS } from '../types/appeal';

export function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function getStatusTextClass(status: AppealStatus): string {
  switch (status) {
    case 'Yangi':
      return 'text-blue-700 font-semibold';
    case "Ko'rib chiqilmoqda":
      return 'text-amber-700 font-semibold';
    case 'Yakunlandi':
      return 'text-emerald-700 font-semibold';
  }
}

export function getStatusBarClass(status: AppealStatus): string {
  switch (status) {
    case 'Yangi':
      return 'bg-blue-600';
    case "Ko'rib chiqilmoqda":
      return 'bg-amber-500';
    case 'Yakunlandi':
      return 'bg-emerald-600';
  }
}

export function sanitizeAppealInput(input: {
  studentName: string;
  group: string;
  description: string;
  responseNote?: string;
}) {
  return {
    studentName: input.studentName.trim().slice(0, FIELD_LIMITS.studentNameMax),
    group: input.group.trim().toUpperCase().slice(0, FIELD_LIMITS.groupMax),
    description: input.description.trim().slice(0, FIELD_LIMITS.descriptionMax),
    responseNote: (input.responseNote ?? '').trim().slice(0, FIELD_LIMITS.responseNoteMax),
  };
}

export function exportAppealsToCsv(appeals: Appeal[], filenamePrefix = 'talaba-murojaatlar') {
  const headers = ['ID', 'Sana', 'Talaba', 'Guruh', 'Murojaat turi', 'Holati', 'Batafsil izoh', "Mas'ul javobi"];
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

  const rows = appeals.map((a) => [
    escapeCell(a.id),
    escapeCell(formatDateTime(a.createdAt)),
    escapeCell(a.studentName),
    escapeCell(a.group),
    escapeCell(a.type),
    escapeCell(a.status),
    escapeCell(a.description),
    escapeCell(a.responseNote || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.map(escapeCell).join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}-${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
