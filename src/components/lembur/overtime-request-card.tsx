import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { DateBlock } from '@/components/date-block';
import { StatColumn } from '@/components/stat-column';
import { StatusBadge } from '@/components/status-badge';
import type { RequestStatus } from '@/constants/status';

export type OvertimeRequest = {
  id: string;
  date: string; // ISO yyyy-MM-dd
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  duration: string;
  reason: string;
  status: RequestStatus;
};

const STATUS_DATE_BLOCK_CLASSES: Record<RequestStatus, string> = {
  Menunggu: 'bg-amber-600',
  Disetujui: 'bg-emerald-700',
  Ditolak: 'bg-red-600',
};

export function OvertimeRequestCard({ request }: { request: OvertimeRequest }) {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-card p-3">
      <DateBlock iso={request.date} colorClassName={STATUS_DATE_BLOCK_CLASSES[request.status]} />

      <View className="flex-1 justify-center gap-3">
        <View className="flex-row">
          <StatColumn label="Mulai" value={request.start} />
          <StatColumn label="Selesai" value={request.end} divider />
          <StatColumn label="Durasi" value={request.duration} divider />
        </View>

        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="flex-1 text-sm text-muted-foreground">
            {request.reason}
          </Text>
          <StatusBadge status={request.status} />
        </View>
      </View>
    </View>
  );
}
