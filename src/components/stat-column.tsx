import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function StatColumn({
  label,
  value,
  divider,
  danger,
}: {
  label: string;
  value: string;
  divider?: boolean;
  /** Highlights the value in red, e.g. a late check-in time. */
  danger?: boolean;
}) {
  return (
    <View
      className={
        divider
          ? 'flex-1 items-center gap-0.5 border-l border-border'
          : 'flex-1 items-center gap-0.5'
      }>
      <Text
        numberOfLines={1}
        className={
          danger ? 'text-base font-bold text-red-600 dark:text-red-400' : 'text-base font-bold text-text'
        }>
        {value}
      </Text>
      <Text numberOfLines={1} className="text-xs text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}
