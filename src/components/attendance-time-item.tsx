import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function AttendanceTimeItem({
  label,
  value,
  size = 'lg',
  tone = 'default',
}: {
  label: string;
  value: string;
  /** `lg` for the hero check-in/check-out figures, `sm` for a derived stat like total hours. */
  size?: 'lg' | 'sm';
  tone?: 'default' | 'primary' | 'muted' | 'danger';
}) {
  const valueClass =
    size === 'lg'
      ? tone === 'primary'
        ? 'text-2xl font-bold text-primary'
        : tone === 'muted'
          ? 'text-2xl font-bold text-muted-foreground'
          : tone === 'danger'
            ? 'text-2xl font-bold text-red-600 dark:text-red-400'
            : 'text-2xl font-bold text-text'
      : 'text-base font-semibold text-text';

  return (
    <View className="flex-1 items-center gap-1">
      <Text className={`${valueClass} text-center`}>{value}</Text>
      <Text className="text-center text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
