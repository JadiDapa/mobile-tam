import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { StatColumn } from '@/components/stat-column';
import { StatusBadge } from '@/components/status-badge';
import { API_STATUS_LABEL, LEAVE_REASON_CATEGORY_LABEL, LEAVE_TYPE_LABEL } from '@/constants/status';
import { countDaysInclusive, formatShortDateNoYear } from '@/lib/date';
import type { LeaveRequest } from '@/lib/queries';

import { TypeBadge, type LeaveType } from './type-badge';

export function LeaveRequestCard({ request }: { request: LeaveRequest }) {
  const type = LEAVE_TYPE_LABEL[request.type] as LeaveType;
  const status = API_STATUS_LABEL[request.status];

  return (
    <View className="gap-3 rounded-2xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <TypeBadge type={type} />
        <StatusBadge status={status} />
      </View>

      <View className="flex-row">
        <StatColumn label="Mulai" value={formatShortDateNoYear(request.startDate)} />
        <StatColumn label="Selesai" value={formatShortDateNoYear(request.endDate)} divider />
        <StatColumn
          label="Durasi"
          value={`${countDaysInclusive(request.startDate, request.endDate)} Hari`}
          divider
        />
      </View>

      {request.reasonCategory && (
        <Text className="text-xs font-medium text-muted-foreground">
          {LEAVE_REASON_CATEGORY_LABEL[request.reasonCategory]}
        </Text>
      )}

      {request.detail.length > 0 && (
        <Text numberOfLines={2} className="text-sm text-muted-foreground">
          {request.detail}
        </Text>
      )}
    </View>
  );
}
