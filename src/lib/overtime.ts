import { parseTimeToMinutes } from '@/lib/date';

/**
 * Fallback Jam Mulai Lembur kalau `/api/settings` belum mengirim
 * `overtimeStartTime` (backend lama) atau Hari Kerja hari ini tidak ada —
 * sama dengan jadwal bawaan server (`DEFAULT_WORK_DAYS` di dashboard).
 */
export const FALLBACK_OVERTIME_START_TIME = '18:00';

/** WIB = UTC+7, tanpa daylight saving — sama dengan `APP_TIMEZONE` server (Asia/Jakarta). */
const APP_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Hari (0 = Minggu … 6 = Sabtu) tanggal kerja di Asia/Jakarta, tidak
 * tergantung zona waktu perangkat — server memilih Hari Kerja dengan cara ini.
 */
export function getWorkDayOfWeek(date: Date): number {
  return new Date(date.getTime() + APP_UTC_OFFSET_MS).getUTCDay();
}

/** Jam Mulai Lembur ("HH:mm") Hari Kerja untuk tanggal kerja `date`. */
export function overtimeStartTimeFor(
  workDays: readonly { dayOfWeek: number; overtimeStartTime?: string }[] | undefined,
  date: Date,
): string {
  const dayOfWeek = getWorkDayOfWeek(date);
  const day = workDays?.find((workDay) => workDay.dayOfWeek === dayOfWeek);

  return day?.overtimeStartTime ?? FALLBACK_OVERTIME_START_TIME;
}

/**
 * Lembur boleh dimulai pada jam `startTime` ("HH:mm") kalau sudah sampai
 * `overtimeStartTime` — cerminan `canStartOvertimeAt()` di server, yang tetap
 * jadi penentu akhir.
 */
export function canStartOvertimeAt(startTime: string, overtimeStartTime: string): boolean {
  const start = parseTimeToMinutes(startTime);
  const limit = parseTimeToMinutes(overtimeStartTime);

  return start !== null && limit !== null && start >= limit;
}
