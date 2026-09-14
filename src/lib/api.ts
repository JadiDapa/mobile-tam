import { useAuth } from '@clerk/expo';
import { useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL — set it in .env');
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Fetch ke API dashboard Next.js dengan token sesi Clerk sebagai Bearer.
 * `clerkMiddleware` di dashboard (proxy.ts) sudah mengenali header ini secara
 * otomatis — tidak ada endpoint login terpisah, sign-in tetap lewat Clerk
 * langsung di device (lihat (auth)/login.tsx).
 */
export function useApi() {
  const { getToken } = useAuth();

  return useCallback(
    async <T = unknown>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getToken();
      const isFormData = init?.body instanceof FormData;

      const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ApiError(response.status, data?.error ?? 'Terjadi kesalahan');
      }

      return data as T;
    },
    [getToken],
  );
}
