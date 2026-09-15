import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function ReviewedDivider() {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border" />
      <Text className="text-xs text-muted-foreground">Sudah direview</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
