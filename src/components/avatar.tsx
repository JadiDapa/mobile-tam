import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type AvatarProps = {
  name: string;
  /** Path relatif dari API (mis. `/api/images/xxx.jpg`) atau `null`. */
  imageUri?: string | null;
  size?: number;
};

export function Avatar({ name, imageUri, size = 48 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const { getToken } = useAuth();
  const [authHeader, setAuthHeader] = useState<string | null>(null);

  // `/api/images/...` butuh Bearer token dashboard — beda dari web yang
  // otomatis kirim cookie sesi Clerk lewat <img> biasa.
  useEffect(() => {
    if (!imageUri) return;
    let active = true;
    getToken().then((token) => {
      if (active && token) setAuthHeader(`Bearer ${token}`);
    });
    return () => {
      active = false;
    };
  }, [imageUri, getToken]);

  if (imageUri && authHeader) {
    return (
      <Image
        source={{ uri: `${API_URL}${imageUri}`, headers: { Authorization: authHeader } }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-muted">
      <Text style={{ fontSize: size / 2.2 }} className="font-bold text-text">
        {initial}
      </Text>
    </View>
  );
}
