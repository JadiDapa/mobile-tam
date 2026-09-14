import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';

export function SectionHeader({
  title,
  count,
  onSeeAll,
}: {
  title: string;
  count: number;
  onSeeAll?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <Text numberOfLines={1} className="flex-1 text-lg font-bold text-text">
        {title} <Text className="text-sm font-normal text-muted-foreground">({count})</Text>
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8} className="flex-row items-center gap-0.5">
          <Text className="text-sm font-semibold text-primary">Lebih Banyak</Text>
          <Icon name="chevron-forward-outline" size={14} tone="primary" />
        </Pressable>
      )}
    </View>
  );
}
