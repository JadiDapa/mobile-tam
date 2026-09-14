import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, type IoniconsIconName } from '@/components/icon';
import { Card } from '@/components/ui/card';
import { STATUS_TEXT_CLASSES, type RequestStatus } from '@/constants/status';

/** `date` is a raw ISO timestamp — the row renders its own day/month chip from it. */
export type SummaryRequest = {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  status: RequestStatus;
};

function DateChip({ iso }: { iso: string }) {
  const parsed = new Date(iso);
  const day = parsed.getDate();
  const month = parsed
    .toLocaleDateString('id-ID', { month: 'short' })
    .toUpperCase()
    .replace('.', '');

  return (
    <View className="h-12 w-12 items-center justify-center rounded-xl bg-accent dark:border dark:border-border dark:bg-background">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-primary">{month}</Text>
      <Text className="text-lg font-bold leading-5 text-text">{day}</Text>
    </View>
  );
}

function RequestRow({
  title,
  subtitle,
  date,
  status,
  showDivider,
}: SummaryRequest & { showDivider: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-3 py-3 ${showDivider ? 'border-b border-border' : ''}`}>
      <DateChip iso={date} />

      <View className="flex-1 gap-0.5">
        {subtitle && (
          <Text className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {subtitle}
          </Text>
        )}
        <Text numberOfLines={2} className="text-sm font-semibold leading-5 text-text">
          {title}
        </Text>
      </View>

      <View className="rounded-md border border-border px-2 py-1">
        <Text className={`text-[11px] font-semibold ${STATUS_TEXT_CLASSES[status]}`}>
          {status}
        </Text>
      </View>
    </View>
  );
}

export function RequestListGroup({
  items,
  icon,
  emptyLabel,
}: {
  items: SummaryRequest[];
  icon: IoniconsIconName;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <Card className="flex-row items-center gap-3 px-4 py-5">
        <Icon name={icon} size={18} tone="muted" />
        <Text className="flex-1 text-sm text-muted-foreground">{emptyLabel}</Text>
      </Card>
    );
  }

  return (
    <Card className="px-4">
      {items.map((item, index) => (
        <RequestRow key={item.id} showDivider={index < items.length - 1} {...item} />
      ))}
    </Card>
  );
}
