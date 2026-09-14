import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1.5">
      <Text className="text-4xl font-bold tracking-tight text-text">{value}</Text>
      <Text numberOfLines={2} className="text-sm font-medium text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}
