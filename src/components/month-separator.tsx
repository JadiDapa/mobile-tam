import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function MonthSeparator({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-sm font-bold text-text">{label}</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
