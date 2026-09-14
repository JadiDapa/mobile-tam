export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const LONG_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** "Rabu, 9 September 2026" */
export function formatLongIndonesianDate(date: Date) {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${LONG_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** "9 Sep 2026" */
export function formatShortDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** "9 Sep" (no year) */
export function formatShortDateNoYear(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]}`;
}

/** "HH:mm" */
export function formatTime(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Duration between two ISO timestamps as "1j 30m" / "45m" — "--:--" when either side is missing or negative. */
export function formatDuration(startIso: string | null, endIso: string | null) {
  if (!startIso || !endIso) return '--:--';

  const minutes = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (minutes < 0) return '--:--';

  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}j ${minutes % 60}m` : `${minutes}m`;
}

/** "2026-8" — groups dates by calendar month regardless of day. */
export function monthKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/** "September 2026" */
export function monthLabel(iso: string) {
  const date = new Date(iso);
  return `${LONG_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** Inclusive day count between two "YYYY-MM-DD" dates. */
export function countDaysInclusive(start: string, end: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / msPerDay) + 1;
}

/** Every "YYYY-MM-DD" date from start to end, inclusive. */
export function eachDateInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);

  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}
