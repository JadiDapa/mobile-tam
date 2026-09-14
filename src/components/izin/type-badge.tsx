import { Text } from '@/components/ui/text';

export type LeaveType = 'Sakit' | 'Izin' | 'Cuti';

const TYPE_TEXT_CLASSES: Record<LeaveType, string> = {
  Sakit: 'text-orange-600 dark:text-orange-400',
  Izin: 'text-amber-600 dark:text-amber-400',
  Cuti: 'text-blue-600 dark:text-blue-400',
};

export function TypeBadge({ type }: { type: LeaveType }) {
  return <Text className={`text-xs font-semibold ${TYPE_TEXT_CLASSES[type]}`}>{type}</Text>;
}
