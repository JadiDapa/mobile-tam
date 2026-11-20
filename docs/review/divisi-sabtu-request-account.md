# Panduan review (mobile-tam): Hubungi Admin, Jam Mulai Lembur, Absen Pulang Terlewat

PR ini adalah pasangan dari PR besar di `attendance-tam` (backend + web).
Gambaran lengkap fitur, alasan desain, dan FAQ ada di
`attendance-tam/docs/review/divisi-sabtu-request-account.md`. Dokumen ini
hanya menjelaskan bagian aplikasi mobile.

**Ukuran:** 24 file, +526 / −334 baris, 6 commit. Tidak ada dependency baru,
tidak ada modul native baru.

---

## 1. Ringkasan satu menit

| Fitur | Sebelum | Sesudah |
|---|---|---|
| **Hubungi Admin** (tiket 08) | Login & welcome punya link "Ajukan pembuatan akun" ke form publik. | Link diganti dialog **Hubungi Admin**: email admin (bisa disalin dengan tekan lama) + tombol "Kirim email" bertemplate. Layar `request-account` lama redirect ke login. |
| **Jam Mulai Lembur** (tiket 03) | Drawer mulai Lembur menolak jam < 18:00 untuk semua hari (konstanta). | Batasnya Jam Mulai Lembur Hari Kerja hari ini dari `/api/settings` (Sabtu 14:00, hari biasa 18:00). |
| **Absen Pulang Terlewat** (tiket 05) | Modal "Absen Pulang Terlewat", tombol "Otomatis pukul 17:00", jam bebas. | Judul "Absen pulang hari Sabtu, 14 Nov", menampilkan jam masuk, tombol "Otomatis pukul 14:00", jam pulang ≤ jam masuk ditolak dengan pesan yang sama seperti server. |
| **Lint hijau** | `expo lint` gagal. | Hijau, tanpa mengubah perilaku. |

Divisi & routing **tidak butuh perubahan mobile** — semua penyaringan
(tab Review, pilihan karyawan Dinas luar) dilakukan di server.

---

## 2. Kompatibilitas — kenapa aman

Kode ini ditulis supaya jalan dengan **backend lama maupun baru**, karena urutan
rilisnya backend dulu, lalu mobile lewat OTA — dan selama jeda itu bisa saja
terbalik.

| Situasi | Perilaku |
|---|---|
| Backend lama (belum ada `overtimeStartTime` di `/api/settings`) | Fallback 18:00 = perilaku lama (`FALLBACK_OVERTIME_START_TIME`). |
| Backend lama (belum ada `missedDays` di `/api/attendance/missed`) | `normalizeMissedDays()` merakit data dari `days` lama; modal jatuh ke tampilan lama (tanpa jam masuk), server yang memilih jam otomatis. |
| `/api/settings` masih dimuat | Drawer Lembur **tidak** memblokir pakai fallback 18:00 — supaya Lembur Sabtu 14:00 tidak tertahan keliru. Server tetap memvalidasi ulang. |
| Aplikasi 1.1.0 (belum update) dengan backend baru | Ditangani di backend: `days` tetap dikirim, endpoint request account membalas 410 + pesan, server memvalidasi jam pulang. |

**OTA aman:** `app.json` memakai `runtimeVersion.policy = "appVersion"`, dan PR
ini tidak menambah modul native (itulah sebabnya tidak ada tombol salin —
`expo-clipboard` adalah modul native = APK baru). Jadi bisa dikirim lewat
`eas update`.

---

## 3. Cara membaca

| Commit | Tiket | File |
|---|---|---|
| `b19aea0` | 03 Jam Mulai Lembur | `src/lib/overtime.ts` (B), `src/lib/queries.ts`, `src/components/overtime-request-drawer.tsx` |
| `5f81c7f` | 05 Absen Pulang Terlewat | `src/lib/missed-checkout.ts` (B), `src/lib/date.ts`, `src/lib/queries.ts`, `src/lib/overtime.ts`, `src/components/missed-checkout-modal.tsx` |
| `fbd405e` | (lint) | 13 file, tanpa perubahan perilaku |
| `161b140` | 08 Hubungi Admin | `src/lib/contact-admin.ts` (B), `src/components/contact-admin-dialog.tsx` (B), login, welcome, request-account |
| `de064b9`, `ba7314b` | (docs) | README, satu komentar |

Urutan baca: `src/lib/*` (aturan kecil, mudah dibaca) → komponen → layar.

---

## 4. Referensi per file

(B = file baru)

### Logika (`src/lib/`)

| File | Perubahan | Alasan |
|---|---|---|
| `src/lib/overtime.ts` (B) | `overtimeStartTimeFor(workDays, date)`, `canStartOvertimeAt()`, `getWorkDayOfWeek()`, fallback 18:00. | Cerminan `canStartOvertimeAt()` server. Hari dihitung di WIB (UTC+7), **bukan** zona perangkat, supaya memilih Hari Kerja yang sama dengan server walau HP karyawan di zona lain. |
| `src/lib/missed-checkout.ts` (B) | `normalizeMissedDays()`, `missedCheckoutTimeError()`, `initialPickerTime()`. | Kompatibel backend lama; pesan validasi sama persis dengan server; picker mulai di jam otomatis (bukan jam sekarang), karena jam sekarang yang membuat karyawan dulu mengisi "pulang 05:00". |
| `src/lib/contact-admin.ts` (B) | Teks dialog, template email, `contactAdminMailto()`, pesan gagal membuka email. | **Salinan verbatim** dari `attendance-tam/lib/contact-admin.ts` (dua repo tidak bisa saling impor). Kalau salah satu diubah, ubah keduanya. |
| `src/lib/date.ts` | `parseTimeToMinutes()` (dipindah dari `home.tsx`, plus validasi jam/menit), `formatHourMinute()`. | Satu helper, sebelumnya `formatTime(date)` lokal ada di 3 komponen. |
| `src/lib/queries.ts` | Tipe `overtimeStartTime?` di `AttendanceSettings`; tipe `MissedCheckoutDay` & `MissedCheckoutResponse` (`missedDays?` opsional). | Opsional karena backend lama belum mengirimnya. |

### Komponen & layar

| File | Perubahan | Alasan |
|---|---|---|
| `src/components/contact-admin-dialog.tsx` (B) | Modal Hubungi Admin; email `selectable`; "Kirim email" via `Linking.openURL(mailto:)`, pesan kalau tidak ada aplikasi email. | Pengganti form publik; sama dengan dialog web. Latar penutup dipisah dari kartu supaya tekan lama di email tidak tertangkap `Pressable`. |
| `src/app/(auth)/login.tsx`, `welcome.tsx` | Link request account → `<ContactAdminDialog />`. | Fitur Hubungi Admin. |
| `src/app/(auth)/request-account.tsx` | Form 165 baris → `<Redirect href="/login" />`. | Deep link lama tidak 404. |
| `src/components/overtime-request-drawer.tsx` | Konstanta `MIN_HOUR = 18` dihapus; batas dari `useSettingsQuery()`; pesan menyebut jamnya. | Jam Mulai Lembur per Hari Kerja. |
| `src/components/missed-checkout-modal.tsx` | Judul hari, jam masuk, tombol "Otomatis pukul HH:mm", validasi client, pesan error server (`ApiError`) ditampilkan apa adanya. Kalau jam otomatis < jam masuk, wajib pilih jam sendiri. | Absen Pulang Terlewat. Server tetap penentu. |
| `src/components/overtime-end-drawer.tsx` | `formatTime` lokal → `formatHourMinute`. | Hapus duplikasi (lint). |

### Lint tanpa perubahan perilaku (`fbd405e`)

| File | Perubahan | Alasan |
|---|---|---|
| `src/app/employee-data-{contact,employment,identity}.tsx` | `useEffect(() => setForm(...))` → nilai turunan: `form = draft ?? dariProfil`. | Aturan `react-hooks/set-state-in-effect`. Perilaku sama: form menampilkan data tersimpan sampai diedit pertama kali. |
| `src/components/{date-range,month-year,single-date}-picker.tsx` | Reset draft saat sheet dibuka dipindah dari effect ke "adjust state during render" (`wasVisible`). | Aturan yang sama; pola yang direkomendasikan React. |
| `src/hooks/use-color-scheme.web.ts` | `useEffect` hydrated → `useSyncExternalStore`. | Aturan yang sama; render pertama tetap cocok dengan HTML statis. |
| `src/app/(tabs)/(beranda)/home.tsx` | `parseTimeToMinutes` lokal dihapus (pindah ke `lib/date`); `monthStats` yang tidak dipakai dihapus. | Unused variable. |
| `src/app/employee-data.tsx`, `src/components/option-drawer.tsx`, `year-picker.tsx` | Import yang tidak dipakai dihapus. | Unused import. |

### Dokumentasi

| File | Perubahan | Alasan |
|---|---|---|
| `README.md` | Pendaftaran mandiri ditutup; Jam Mulai Lembur dari server. | Sinkron dengan kode. |
| `docs/review/divisi-sabtu-request-account.md` (B) | Dokumen ini. | Panduan review. |

---

## 5. FAQ

**Kenapa tidak ada tombol "Salin" seperti di web?**
Butuh `expo-clipboard` = modul native = APK baru, padahal rilis ini ingin
lewat OTA. Sebagai gantinya email ditampilkan sebagai teks `selectable`
(tekan lama → menu salin bawaan sistem), dan ada petunjuk di bawahnya.

**Kenapa `contact-admin.ts` disalin, bukan dibagi?**
Dua repo terpisah tanpa paket bersama. Komentar di kedua file mengingatkan
untuk mengubah keduanya.

**Kenapa hari dihitung dengan offset WIB tetap, bukan zona perangkat?**
Server menentukan Hari Kerja di `Asia/Jakarta`. Kalau HP karyawan di zona lain
(atau jamnya salah set), memakai zona perangkat bisa memilih Hari Kerja yang
berbeda dari server. WIB tidak punya daylight saving, jadi offset tetap aman.

**Kenapa validasi ada di mobile padahal server sudah memvalidasi?**
Supaya karyawan tahu lebih awal, dengan pesan yang sama persis. Server tetap
penentu — termasuk untuk aplikasi versi lama.

**Kenapa ada perubahan di layar yang tidak berhubungan (employee-data, picker)?**
Untuk membuat `expo lint` hijau, dipisah di commit sendiri (`fbd405e`) supaya
mudah di-review atau di-revert terpisah. Tidak ada perubahan perilaku.

---

## 6. Cara memverifikasi

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

Keduanya bersih di branch ini. Repo mobile tidak punya test runner (sesuai
spec). Cek manual di simulator:

1. Login / welcome → "Hubungi admin" → tekan lama email, tekan "Kirim email".
2. Buka deep link `request-account` → pindah ke login.
3. Hari Sabtu, setelah absen pulang → drawer mulai Lembur menerima 14:00.
4. Punya absen masuk tanpa absen pulang kemarin → modal menyebut hari, jam
   masuk, dan jam otomatis; pilih jam sebelum jam masuk → ditolak.

**Urutan rilis:** deploy backend `attendance-tam` dulu, lalu `eas update`.
