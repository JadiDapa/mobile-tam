import { formatShortDate, parseTimeToMinutes } from '@/lib/date';
import type { MissedCheckoutDay, MissedCheckoutResponse } from '@/lib/queries';

/**
 * Jam pulang otomatis server lama (sebelum mengikuti Jam Pulang Hari Kerja).
 * Hanya dipakai sebagai nilai awal picker kalau backend belum mengirim
 * `missedDays` — supaya picker tidak mulai di jam sekarang, yang membuat
 * karyawan mengira yang diminta adalah jam saat ini.
 */
const LEGACY_AUTO_CHECKOUT_TIME = '17:00';

/**
 * Hari terlewat dari backend lama (hanya `days`, tanpa `missedDays`): jam masuk
 * dan jam otomatis tidak diketahui, jadi `null` dan modal jatuh ke perilaku lama.
 */
export type LegacyMissedCheckoutDay = {
  workDate: string;
  dayLabel: string;
  checkInTime: null;
  autoCheckOutTime: null;
};

/** `missedDays` kalau ada, kalau tidak dirakit dari `days` (backend lama). */
export function normalizeMissedDays(
  response: MissedCheckoutResponse | undefined,
): (MissedCheckoutDay | LegacyMissedCheckoutDay)[] {
  if (!response) return [];
  if (Array.isArray(response.missedDays)) return response.missedDays;

  return (response.days ?? []).map((workDate) => ({
    workDate,
    dayLabel: formatShortDate(workDate),
    checkInTime: null,
    autoCheckOutTime: null,
  }));
}

/**
 * Cerminan `missedCheckoutTimeError()` di server (pesannya sama persis): jam
 * pulang harus sesudah jam masuk hari itu — mencegah pulang 05:00 untuk masuk
 * 08:00 karena karyawan mengira yang diminta adalah jam sekarang. Server tetap
 * penentu akhir. `checkInTime` null (backend lama) → hanya format yang dicek.
 */
export function missedCheckoutTimeError(
  checkOutTime: string,
  checkInTime: string | null,
): string | null {
  const checkOut = parseTimeToMinutes(checkOutTime);
  const checkIn = checkInTime === null ? null : parseTimeToMinutes(checkInTime);

  if (checkOut === null) return 'Format jam harus HH:mm';
  if (checkIn !== null && checkOut <= checkIn) {
    return `Jam pulang harus setelah jam masuk ${checkInTime}`;
  }

  return null;
}

/**
 * Nilai awal picker "Pilih jam sendiri": jam otomatis hari itu (atau 17:00
 * untuk backend lama) pada tanggal hari ini, di zona perangkat — picker
 * menampilkan jam dinding perangkat, dan `formatHourMinute` membacanya balik.
 */
export function initialPickerTime(day: MissedCheckoutDay | LegacyMissedCheckoutDay): Date {
  const minutes = parseTimeToMinutes(day.autoCheckOutTime ?? LEGACY_AUTO_CHECKOUT_TIME) ?? 0;
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return date;
}
