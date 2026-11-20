import { Redirect } from 'expo-router';

/**
 * Pendaftaran mandiri ditutup — akun hanya dibuat admin (lihat dialog Hubungi
 * Admin di layar login). Rute tetap ada supaya deep link lama tidak 404.
 */
export default function RequestAccountScreen() {
  return <Redirect href="/login" />;
}
