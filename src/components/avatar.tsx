import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type AvatarProps = {
  name: string;
  imageUri?: string | null;
  size?: number;
};

export function Avatar({ name, imageUri, size = 48 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
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
