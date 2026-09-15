import { View } from 'react-native';
import { Text } from '@/components/ui/text';

/** Badge merah kecil dengan angka — dipasang absolute di pojok kanan-atas sebuah icon. */
export function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <View className="absolute -right-1.5 -top-1.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 py-0.5">
      <Text className="text-[10px] font-bold leading-none text-destructive-foreground">{label}</Text>
    </View>
  );
}
