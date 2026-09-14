import type {
  EmploymentStatus,
  Gender,
  LeaveReasonCategory,
  MaritalStatus,
  Religion,
  TransportationType,
  WorkMode,
} from '@/lib/queries';

/** Indonesian-language status shared by leave and overtime requests. */
export type RequestStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export const API_STATUS_LABEL: Record<'PENDING' | 'APPROVED' | 'REJECTED', RequestStatus> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

export const STATUS_DOT_CLASSES: Record<RequestStatus, string> = {
  Menunggu: 'bg-amber-500',
  Disetujui: 'bg-green-500',
  Ditolak: 'bg-red-500',
};

export const STATUS_TEXT_CLASSES: Record<RequestStatus, string> = {
  Menunggu: 'text-amber-600 dark:text-amber-400',
  Disetujui: 'text-green-600 dark:text-green-400',
  Ditolak: 'text-red-600 dark:text-red-400',
};

export const LEAVE_TYPE_LABEL: Record<'IZIN' | 'SAKIT' | 'CUTI', string> = {
  IZIN: 'Izin',
  SAKIT: 'Sakit',
  CUTI: 'Cuti',
};

export const LEAVE_REASON_CATEGORY_LABEL: Record<LeaveReasonCategory, string> = {
  CUTI_TAHUNAN: 'Cuti Tahunan',
  CUTI_KHUSUS: 'Cuti Khusus',
  MELAHIRKAN: 'Melahirkan',
  MENIKAH: 'Menikah',
  IZIN_PRIBADI: 'Izin Pribadi',
  IZIN_KELUARGA: 'Izin Keluarga',
  KEPERLUAN_MENDESAK: 'Keperluan Mendesak',
  DATANG_TERLAMBAT: 'Datang Terlambat',
  PULANG_LEBIH_AWAL: 'Pulang Lebih Awal',
  TIDAK_MASUK: 'Tidak Masuk',
  LAINNYA: 'Lainnya',
};

export const CUTI_REASON_CATEGORIES: LeaveReasonCategory[] = [
  'CUTI_TAHUNAN',
  'CUTI_KHUSUS',
  'MELAHIRKAN',
  'MENIKAH',
  'LAINNYA',
];

export const IZIN_REASON_CATEGORIES: LeaveReasonCategory[] = [
  'IZIN_PRIBADI',
  'IZIN_KELUARGA',
  'KEPERLUAN_MENDESAK',
  'DATANG_TERLAMBAT',
  'PULANG_LEBIH_AWAL',
  'TIDAK_MASUK',
  'LAINNYA',
];

export const TRANSPORTATION_LABEL: Record<TransportationType, string> = {
  MOBIL_DINAS: 'Mobil Dinas',
  KENDARAAN_PRIBADI: 'Kendaraan Pribadi',
  PESAWAT: 'Pesawat',
  KERETA: 'Kereta',
  BUS: 'Bus',
  LAINNYA: 'Lainnya',
};

export const TRANSPORTATION_OPTIONS: TransportationType[] = [
  'MOBIL_DINAS',
  'KENDARAAN_PRIBADI',
  'PESAWAT',
  'KERETA',
  'BUS',
  'LAINNYA',
];

export const GENDER_LABEL: Record<Gender, string> = {
  LAKI_LAKI: 'Laki-laki',
  PEREMPUAN: 'Perempuan',
};

export const GENDER_OPTIONS: Gender[] = ['LAKI_LAKI', 'PEREMPUAN'];

export const RELIGION_LABEL: Record<Religion, string> = {
  ISLAM: 'Islam',
  KRISTEN: 'Kristen',
  KATOLIK: 'Katolik',
  HINDU: 'Hindu',
  BUDDHA: 'Buddha',
  KONGHUCU: 'Konghucu',
  LAINNYA: 'Lainnya',
};

export const RELIGION_OPTIONS: Religion[] = [
  'ISLAM',
  'KRISTEN',
  'KATOLIK',
  'HINDU',
  'BUDDHA',
  'KONGHUCU',
  'LAINNYA',
];

export const MARITAL_STATUS_LABEL: Record<MaritalStatus, string> = {
  BELUM_KAWIN: 'Belum Kawin',
  KAWIN: 'Kawin',
  CERAI_HIDUP: 'Cerai Hidup',
  CERAI_MATI: 'Cerai Mati',
};

export const MARITAL_STATUS_OPTIONS: MaritalStatus[] = [
  'BELUM_KAWIN',
  'KAWIN',
  'CERAI_HIDUP',
  'CERAI_MATI',
];

export const EMPLOYMENT_STATUS_LABEL: Record<EmploymentStatus, string> = {
  PKWT: 'PKWT',
  PKWTT: 'PKWTT',
};

export const EMPLOYMENT_STATUS_OPTIONS: EmploymentStatus[] = ['PKWT', 'PKWTT'];

/** Mode kerja yang bisa dipilih admin saat menyetujui absensi luar radius. */
export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  HADIR_DIKANTOR: 'Hadir di Kantor',
  DINAS_LUAR: 'Dinas Luar',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  CUTI: 'Cuti',
};

export const WORK_MODE_OPTIONS: WorkMode[] = [
  'HADIR_DIKANTOR',
  'DINAS_LUAR',
  'SAKIT',
  'IZIN',
  'CUTI',
];
