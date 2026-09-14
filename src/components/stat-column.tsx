import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function StatColumn({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View
      className={
        divider
          ? 'flex-1 items-center gap-0.5 border-l border-border'
          : 'flex-1 items-center gap-0.5'
      }>
      <Text numberOfLines={1} className="text-base font-bold text-text">
        {value}
      </Text>
      <Text numberOfLines={1} className="text-xs text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}
