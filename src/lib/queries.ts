import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApi } from '@/lib/api';

/** Cocok dengan respons GET /api/me (dashboard/app/api/me/route.ts). */
export type Me = {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPERVISOR' | 'MANAGER';
  phone: string | null;
  position: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

/** Satu baris Attendance (dashboard/prisma/schema.prisma), tanggal sebagai ISO string lewat JSON. */
export type AttendanceRecord = {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  isLate: boolean;
  /** Menit terlambat dari jam masuk terjadwal, tanpa toleransi — tetap > 0 walau `isLate` false. */
  lateMinutes: number;
  isWithinRadius: boolean | null;
  isManual: boolean;
  workMode: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
};

export type DailyAttendance = {
  workDate: string;
  checkIn: AttendanceRecord | null;
  checkOut: AttendanceRecord | null;
};

export type LeaveReasonCategory =
  | 'CUTI_TAHUNAN'
  | 'CUTI_KHUSUS'
  | 'MELAHIRKAN'
  | 'MENIKAH'
  | 'IZIN_PRIBADI'
  | 'IZIN_KELUARGA'
  | 'KEPERLUAN_MENDESAK'
  | 'DATANG_TERLAMBAT'
  | 'PULANG_LEBIH_AWAL'
  | 'TIDAK_MASUK'
  | 'LAINNYA';

export type LeaveRequest = {
  id: string;
  type: 'IZIN' | 'SAKIT' | 'CUTI';
  startDate: string;
  endDate: string;
  detail: string;
  reasonCategory: LeaveReasonCategory | null;
  attachmentUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  createdAt: string;
};

export type FaceStatus = {
  enrolled: boolean;
  totalPhotos: number;
  minRequired: number;
  recommendedPhotos: number;
  maxPhotos: number;
};

/** Cocok dengan respons GET /api/settings (dashboard/app/api/settings/route.ts). */
export type AttendanceSettings = {
  officeLocation: { name: string; latitude: number; longitude: number; radiusMeters: number } | null;
  workSchedule: { lateToleranceMinutes: number; maxAccuracyMeters: number } | null;
  workDays: {
    dayOfWeek: number;
    isWorkingDay: boolean;
    checkInTime: string;
    checkOutTime: string;
  }[];
};

/** Satu baris Overtime (dashboard/prisma/schema.prisma), tanggal sebagai ISO string lewat JSON. */
export type OvertimeRecord = {
  id: string;
  startAt: string;
  endAt: string | null;
  durationMinutes: number | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
};

export type TransportationType =
  | 'MOBIL_DINAS'
  | 'KENDARAAN_PRIBADI'
  | 'PESAWAT'
  | 'KERETA'
  | 'BUS'
  | 'LAINNYA';

/** Satu baris FieldAssignment (dashboard/prisma/schema.prisma) — dinas luar. */
export type FieldAssignmentRecord = {
  id: string;
  startDate: string;
  endDate: string;
  activityDetail: string;
  destinationCity: string;
  destinationAddress: string;
  purpose: string;
  companyName: string | null;
  transportation: TransportationType;
  transportationOther: string | null;
  estimatedCost: number;
  attachmentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  employees: { id: string; name: string }[];
  createdBy: { id: string; name: string };
};

/** Karyawan pemilik pengajuan — disertakan hanya pada endpoint approval (`/pending`, admin/supervisor/manager). */
export type RequesterSummary = { id: string; name: string; position: string | null };

export type PendingLeaveRequest = LeaveRequest & { user: RequesterSummary };

export type PendingOvertimeRequest = OvertimeRecord & { user: RequesterSummary };

export type WorkMode = 'HADIR_DIKANTOR' | 'LUAR_RADIUS' | 'SAKIT' | 'IZIN' | 'CUTI';

/** Satu baris Attendance luar radius yang menunggu verifikasi admin. */
export type PendingAttendanceApproval = {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  workDate: string;
  workMode: WorkMode;
  workModeDetail: string | null;
  distanceMeters: number | null;
  user: RequesterSummary;
};

export type Employee = { id: string; name: string; position: string | null };

export type Gender = 'LAKI_LAKI' | 'PEREMPUAN';

export type Religion = 'ISLAM' | 'KRISTEN' | 'KATOLIK' | 'HINDU' | 'BUDDHA' | 'KONGHUCU' | 'LAINNYA';

export type MaritalStatus = 'BELUM_KAWIN' | 'KAWIN' | 'CERAI_HIDUP' | 'CERAI_MATI';

export type EmploymentStatus = 'PKWT' | 'PKWTT';

/** Cocok dengan respons GET /api/profile (dashboard) — satu record per kategori per
 * karyawan, `null` sebelum pernah diisi (kondisi awal yang normal, bukan error). */
export type PersonalIdentity = {
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: Gender;
  religion: Religion;
  maritalStatus: MaritalStatus;
  nationality: string;
  ktpPhotoUrl: string | null;
};

export type Contact = {
  domicileAddress: string;
  ktpAddress: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
};

export type EmploymentData = {
  employeeNumber: string;
  workLocation: string;
  employmentStatus: EmploymentStatus;
  startDate: string;
  contractEndDate: string | null;
};

export type WorkHistory = {
  previousCompany: string | null;
  previousPosition: string | null;
  previousDuration: string | null;
};

export type AdministrativeDocument = {
  ktpUrl: string | null;
  npwpUrl: string | null;
  kkUrl: string | null;
  ijazahUrl: string | null;
  transkripUrl: string | null;
  sertifikatUrl: string | null;
  bankBookUrl: string | null;
  pasFotoUrl: string | null;
  cvUrl: string | null;
};

export type Payroll = {
  baseSalary: number;
  allowance: number | null;
  bonus: number | null;
  bankAccountNumber: string;
  bankAccountName: string;
  bpjsKesehatanNumber: string | null;
  bpjsKetenagakerjaanNumber: string | null;
};

export type Training = {
  trainingHistory: string | null;
};

export type ProfileData = {
  personalIdentity: PersonalIdentity | null;
  contact: Contact | null;
  employmentData: EmploymentData | null;
  workHistory: WorkHistory | null;
  administrativeDocument: AdministrativeDocument | null;
  payroll: Payroll | null;
  training: Training | null;
};

/** Field name yang diterima PUT /api/profile/documents — satu per request (partial upload). */
export type AdministrativeDocumentField =
  | 'ktp'
  | 'npwp'
  | 'kk'
  | 'ijazah'
  | 'transkrip'
  | 'sertifikat'
  | 'bankBook'
  | 'pasFoto'
  | 'cv';

type ActionResult = { ok: true; message: string } | { ok: false; error: string };

export function useMeQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<Me>('/api/me'),
  });
}

export function useUpdateProfileMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { phone?: string }) =>
      api<ActionResult>('/api/me', { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

/** `from`/`to` sebagai "YYYY-MM-DD" — kosongkan buat bulan berjalan (default server). */
export function useAttendanceHistoryQuery(range?: { from: string; to: string }) {
  const api = useApi();

  return useQuery({
    queryKey: ['attendance', range?.from ?? null, range?.to ?? null],
    queryFn: () => {
      const query = range ? `?from=${range.from}&to=${range.to}` : '';
      return api<{ days: DailyAttendance[] }>(`/api/attendance${query}`);
    },
  });
}

/** Absen masuk/pulang — `formData` harus berisi field yang sama dengan form web (lihat SubmitAttendanceSchema). */
export function useSubmitAttendanceMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api<
        | { ok: true; message: string; warning?: string; lateMinutes?: number }
        | { ok: false; error: string }
      >('/api/attendance', { method: 'POST', body: formData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useLeaveRequestsQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['leave'],
    queryFn: () => api<{ items: LeaveRequest[] }>('/api/leave'),
  });
}

/** `formData` harus berisi: type ("IZIN"|"SAKIT"|"CUTI"), startDate, endDate ("YYYY-MM-DD"), detail,
 * reasonCategory (wajib utk CUTI/IZIN, harus kosong utk SAKIT), attachment (wajib utk SAKIT). */
export function useCreateLeaveMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api<ActionResult>('/api/leave', { method: 'POST', body: formData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  });
}

export function useCancelLeaveMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api<ActionResult>(`/api/leave/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  });
}

/** Pengajuan izin yang menunggu giliran reviewer yang login — admin/supervisor/manager saja. */
export function usePendingLeaveApprovalsQuery(enabled = true) {
  const api = useApi();

  return useQuery({
    queryKey: ['leave-pending'],
    queryFn: () => api<{ items: PendingLeaveRequest[] }>('/api/leave/pending'),
    enabled,
  });
}

/** Setujui/tolak pengajuan izin pada giliran reviewer yang login. */
export function useReviewLeaveMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      reviewNote?: string;
    }) => api<ActionResult>(`/api/leave/${id}/review`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-pending'] });
      queryClient.invalidateQueries({ queryKey: ['review-history'] });
    },
  });
}

/** Hari-hari yang absen masuknya ada tapi absen pulangnya belum dikonfirmasi. */
export function useUnresolvedCheckoutsQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['attendance-missed'],
    queryFn: () => api<{ days: string[] }>('/api/attendance/missed'),
  });
}

/** `workDate`: "YYYY-MM-DD". `time` kosong berarti default 17:00 (lihat server). */
export function useConfirmMissedCheckoutMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { workDate: string; time?: string }) =>
      api<ActionResult>('/api/attendance/missed', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-missed'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useOvertimeHistoryQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['overtime'],
    queryFn: () => api<{ items: OvertimeRecord[] }>('/api/overtime'),
  });
}

/** `startTime`: "HH:mm", harus >= 18:00 (divalidasi ulang di server). */
export function useStartOvertimeMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { startTime: string; reason: string }) =>
      api<ActionResult>('/api/overtime', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overtime'] }),
  });
}

/** `endTime` kosong berarti "sekarang". */
export function useEndOvertimeMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { endTime?: string } = {}) =>
      api<ActionResult>('/api/overtime/end', { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['overtime'] }),
  });
}

/** Pengajuan lembur yang menunggu giliran reviewer yang login — admin/supervisor saja. */
export function usePendingOvertimeApprovalsQuery(enabled = true) {
  const api = useApi();

  return useQuery({
    queryKey: ['overtime-pending'],
    queryFn: () => api<{ items: PendingOvertimeRequest[] }>('/api/overtime/pending'),
    enabled,
  });
}

/** Setujui/tolak pengajuan lembur pada giliran reviewer yang login. */
export function useReviewOvertimeMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      reviewNote?: string;
    }) => api<ActionResult>(`/api/overtime/${id}/review`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-pending'] });
      queryClient.invalidateQueries({ queryKey: ['review-history'] });
    },
  });
}

/** Absensi luar radius yang menunggu verifikasi admin. */
export function usePendingAttendanceApprovalsQuery(enabled = true) {
  const api = useApi();

  return useQuery({
    queryKey: ['attendance-pending'],
    queryFn: () => api<{ items: PendingAttendanceApproval[] }>('/api/attendance/pending'),
    enabled,
  });
}

/** Setujui/tolak absensi luar radius — admin saja. `mode` wajib saat menyetujui. */
export function useReviewAttendanceMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      mode?: WorkMode;
      reviewNote?: string;
    }) => api<ActionResult>(`/api/attendance/${id}/review`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-pending'] }),
  });
}

/** Supervisor: pengajuan yang dia buat. Karyawan/lainnya: pengajuan yang menugaskan mereka. */
export function useFieldAssignmentsQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['field-assignment'],
    queryFn: () => api<{ items: FieldAssignmentRecord[] }>('/api/field-assignment'),
  });
}

/** `formData` harus berisi: employeeIds[] (satu per id), startDate, endDate ("YYYY-MM-DD"),
 * activityDetail, destinationCity, destinationAddress, purpose, transportation,
 * transportationOther? (wajib jika transportation LAINNYA), estimatedCost, companyName?, attachment. */
export function useCreateFieldAssignmentMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api<ActionResult>('/api/field-assignment', { method: 'POST', body: formData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['field-assignment'] }),
  });
}

export function useCancelFieldAssignmentMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<ActionResult>(`/api/field-assignment/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['field-assignment'] }),
  });
}

/** Penugasan dinas luar yang menunggu keputusan admin. */
export function usePendingFieldAssignmentApprovalsQuery(enabled = true) {
  const api = useApi();

  return useQuery({
    queryKey: ['field-assignment-pending'],
    queryFn: () => api<{ items: FieldAssignmentRecord[] }>('/api/field-assignment/pending'),
    enabled,
  });
}

/** Setujui/tolak penugasan dinas luar — admin saja. */
export function useReviewFieldAssignmentMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      reviewNote?: string;
    }) =>
      api<ActionResult>(`/api/field-assignment/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-assignment-pending'] });
      queryClient.invalidateQueries({ queryKey: ['review-history'] });
    },
  });
}

/** Satu baris ApprovalLog (dashboard/prisma/schema.prisma) — riwayat keputusan reviewer. */
export type ApprovalLogEntry = {
  id: string;
  type: 'LEAVE' | 'OVERTIME' | 'FIELD_ASSIGNMENT';
  requestId: string;
  stage: 'SUPERVISOR' | 'MANAGER';
  status: 'APPROVED' | 'REJECTED';
  note: string | null;
  requesterId: string;
  requesterName: string;
  summary: string;
  reviewedAt: string;
};

/**
 * Riwayat keputusan reviewer yang login (tab "Riwayat" di halaman Review) —
 * beda dari `usePendingXApprovalsQuery` yang cuma antrean yang masih
 * menunggu. `type` opsional untuk filter pill.
 */
export function useReviewHistoryQuery(
  type?: ApprovalLogEntry['type'],
  enabled = true,
) {
  const api = useApi();

  return useQuery({
    queryKey: ['review-history', type ?? null],
    queryFn: () =>
      api<{ items: ApprovalLogEntry[] }>(
        `/api/review/history${type ? `?type=${type}` : ''}`,
      ),
    enabled,
  });
}

/**
 * Total pengajuan izin + lembur + dinas luar yang menunggu giliran reviewer yang
 * login — dipakai buat badge lonceng notifikasi & tab Review. Role gating sama
 * persis dengan `(tabs)/(approval)/index.tsx`.
 */
export function usePendingReviewCount() {
  const me = useMeQuery();
  const role = me.data?.role;

  const canSeeLeave = role === 'SUPERVISOR' || role === 'MANAGER';
  const canSeeOvertime = role === 'SUPERVISOR' || role === 'MANAGER';
  const canSeeFieldAssignment = role === 'MANAGER';

  const leave = usePendingLeaveApprovalsQuery(canSeeLeave);
  const overtime = usePendingOvertimeApprovalsQuery(canSeeOvertime);
  const fieldAssignment = usePendingFieldAssignmentApprovalsQuery(canSeeFieldAssignment);

  return (
    (canSeeLeave ? leave.data?.items.length ?? 0 : 0) +
    (canSeeOvertime ? overtime.data?.items.length ?? 0 : 0) +
    (canSeeFieldAssignment ? fieldAssignment.data?.items.length ?? 0 : 0)
  );
}

/** Daftar karyawan aktif — supervisor saja, untuk pemilihan saat membuat penugasan. */
export function useEmployeesQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['employees'],
    queryFn: () => api<{ items: Employee[] }>('/api/users'),
  });
}

/** Status rekap harian (dashboard/lib/attendance.ts `DayStatus`). */
export type RecapDayStatus =
  | 'HADIR_DIKANTOR'
  | 'LUAR_RADIUS'
  | 'DINAS_LUAR'
  | 'SAKIT'
  | 'IZIN'
  | 'ALFA'
  | 'CUTI'
  | 'LIBUR';

/** Satu baris rekap harian — sudah diurutkan server: tidak hadir -> paling telat -> paling awal. */
export type AdminDailyRecapItem = {
  userId: string;
  name: string;
  profileImageUrl: string | null;
  status: RecapDayStatus;
  isLate: boolean;
  lateMinutes: number;
  checkInTime: string | null;
  checkOutTime: string | null;
};

/** Satu baris rekap bulanan per karyawan. */
export type AdminMonthlyRecapItem = {
  userId: string;
  name: string;
  profileImageUrl: string | null;
  nip: string;
  /** Hadir di kantor + dinas luar (dinas luar dihitung hadir). */
  totalAttend: number;
  lateCount: number;
  /** Sakit + izin + cuti + alfa ditotal jadi satu angka. */
  totalNotAttend: number;
  totalLemburMinutes: number;
};

/** Rekap absensi seluruh karyawan — admin saja. `date`: "YYYY-MM-DD", `month`: "YYYY-MM". */
export function useAdminDailyRecapQuery(date: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['admin-attendance-recap', 'daily', date],
    queryFn: () =>
      api<{ items: AdminDailyRecapItem[] }>(
        `/api/admin/attendance-recap?mode=daily&date=${date}`,
      ),
  });
}

export function useAdminMonthlyRecapQuery(month: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['admin-attendance-recap', 'monthly', month],
    queryFn: () =>
      api<{ items: AdminMonthlyRecapItem[] }>(
        `/api/admin/attendance-recap?mode=monthly&month=${month}`,
      ),
  });
}

export type AdminUserListItem = {
  id: string;
  name: string;
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPERVISOR' | 'MANAGER';
  profileImageUrl: string | null;
  isActive: boolean;
  nip: string | null;
  startDate: string | null;
};

/** Seluruh pengguna, difilter opsional per role — admin saja. */
export function useAdminUsersQuery(role?: AdminUserListItem['role']) {
  const api = useApi();

  return useQuery({
    queryKey: ['admin-users', role ?? null],
    queryFn: () =>
      api<{ items: AdminUserListItem[] }>(`/api/admin/users${role ? `?role=${role}` : ''}`),
  });
}

export function useFaceStatusQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['face-status'],
    queryFn: () => api<FaceStatus>('/api/face'),
  });
}

export function useEnrollFaceMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api<{ ok: true; message: string; totalPhotos: number } | { ok: false; error: string }>(
        '/api/face',
        { method: 'POST', body: formData },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['face-status'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useResetFaceMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<{ ok: true; message: string; totalPhotos: number } | { ok: false; error: string }>(
        '/api/face',
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['face-status'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** Lokasi kantor, toleransi telat, dan akurasi GPS maksimal — dibutuhkan sebelum absen. */
export function useSettingsQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api<AttendanceSettings>('/api/settings'),
  });
}

/** Data profil karyawan sendiri — 7 kategori, masing-masing `null` sampai pernah diisi. */
export function useProfileDataQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ['profile-data'],
    queryFn: () => api<ProfileData>('/api/profile'),
  });
}

/** `formData`: nik, placeOfBirth, dateOfBirth ("YYYY-MM-DD"), gender, religion, maritalStatus,
 * nationality, dan ktpPhoto? (opsional — jangan disertakan kalau foto tidak diganti). */
export function useUpdatePersonalIdentityMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api<ActionResult>('/api/profile/personal-identity', { method: 'PUT', body: formData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-data'] }),
  });
}

export function useUpdateContactMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Contact) =>
      api<ActionResult>('/api/profile/contact', { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-data'] }),
  });
}

/** `contractEndDate` wajib diisi (bukan null) ketika `employmentStatus` "PKWT". */
export function useUpdateEmploymentDataMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EmploymentData) =>
      api<ActionResult>('/api/profile/employment-data', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-data'] }),
  });
}

export function useUpdateWorkHistoryMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkHistory) =>
      api<ActionResult>('/api/profile/work-history', { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-data'] }),
  });
}

export function useUpdateTrainingMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Training) =>
      api<ActionResult>('/api/profile/training', { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-data'] }),
  });
}

/** `formData` harus berisi TEPAT SATU field dokumen (lihat AdministrativeDocumentField) —
 * satu upload per request, jangan gabungkan beberapa dokumen dalam satu FormData. */
export function useUpdateDocumentMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api<ActionResult>('/api/profile/documents', { method: 'PUT', body: formData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile-data'] }),
  });
}
