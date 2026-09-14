import { useAuth } from "@clerk/expo";
import type { QueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

/**
 * Semua query "data milik saya" (absensi, izin, lembur, dst.) dicache pakai
 * key yang sama untuk semua user (mis. `['attendance']`) — kalau device
 * dipakai berganti akun (logout lalu login akun lain) tanpa ini, layar bisa
 * sempat menampilkan data cache milik akun sebelumnya sebelum refetch
 * selesai. `queryClient` dibuat sekali untuk umur aplikasi, jadi cache-nya
 * harus dikosongkan manual tiap kali identitas user yang login berubah.
 */
export function useClearQueryCacheOnUserChange(queryClient: QueryClient) {
  const { userId, isLoaded } = useAuth();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    if (
      previousUserId.current !== undefined &&
      previousUserId.current !== userId
    ) {
      queryClient.clear();
    }

    previousUserId.current = userId;
  }, [isLoaded, userId, queryClient]);
}
