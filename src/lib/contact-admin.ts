/**
 * Dialog Hubungi Admin — pengganti layar request account yang ditutup
 * (pendaftaran mandiri dihapus; akun hanya dibuat admin).
 *
 * Salinan verbatim dari `attendance-tam/lib/contact-admin.ts`: teks dialog dan
 * template email harus identik dengan dialog Hubungi Admin di web. Kalau salah
 * satu diubah, ubah keduanya.
 *
 * Bebas impor supaya bisa dicek langsung dengan Node terhadap versi web.
 */

/** Alamat tujuan permohonan akun — bukan email login akun Administrator. */
export const ADMIN_CONTACT_EMAIL = 'admin@tarunagroup.co.id';

export const CONTACT_ADMIN_TITLE = 'Hubungi Admin';

export const CONTACT_ADMIN_DESCRIPTION =
  'Akun absensi hanya dibuat oleh admin. Kirim email ke alamat di bawah dengan mengisi data yang diminta di template.';

export const CONTACT_ADMIN_SUBJECT = 'Permohonan pembuatan akun absensi';

export const CONTACT_ADMIN_BODY = [
  'Halo Admin,',
  '',
  'Saya ingin mengajukan pembuatan akun absensi dengan data berikut:',
  '',
  'Nama:',
  'Email:',
  'No. HP:',
  'Jabatan:',
  'Divisi:',
  '',
  'Terima kasih.',
].join('\n');

/**
 * Pesan kalau `Linking.openURL` gagal (tidak ada aplikasi email). Mobile tidak
 * punya tombol salin — modul clipboard berarti APK baru — jadi pengguna
 * diarahkan menyalin dengan tekan lama.
 */
export const CONTACT_ADMIN_OPEN_FAILED = `Tidak ada aplikasi email yang bisa dibuka. Tekan lama ${ADMIN_CONTACT_EMAIL} untuk menyalinnya, lalu kirim email secara manual.`;

/**
 * `encodeURIComponent`, bukan `URLSearchParams`: yang terakhir menulis spasi
 * sebagai `+`, dan banyak aplikasi email menampilkan `+` itu apa adanya.
 */
export function contactAdminMailto() {
  const subject = encodeURIComponent(CONTACT_ADMIN_SUBJECT);
  const body = encodeURIComponent(CONTACT_ADMIN_BODY);

  return `mailto:${ADMIN_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
