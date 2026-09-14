import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function StatsRow({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <View className="flex-row rounded-2xl bg-muted">
      {items.map((item, index) => (
        <View
          key={item.label}
          className={
            index === 0
              ? 'flex-1 items-center gap-0.5 px-2 py-3'
              : 'flex-1 items-center gap-0.5 border-l border-border px-2 py-3'
          }>
          <Text className="text-lg font-semibold text-text">{item.value}</Text>
          <Text
            numberOfLines={1}
            className="text-center text-xs text-muted-foreground">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
