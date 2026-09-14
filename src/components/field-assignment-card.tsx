import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import { StatusBadge } from '@/components/status-badge';
import { API_STATUS_LABEL, TRANSPORTATION_LABEL } from '@/constants/status';
import { formatShortDateNoYear } from '@/lib/date';
import type { FieldAssignmentRecord } from '@/lib/queries';

/** Kartu baca-saja — karyawan hanya melihat penugasan, aksi setujui/tolak ada
 * di web dashboard (manager) dan supervisor tidak bisa mengubah keputusan. */
export function FieldAssignmentCard({
  assignment,
  showEmployees = true,
}: {
  assignment: FieldAssignmentRecord;
  /** Sembunyikan daftar nama saat kartu ini sudah ditampilkan per-karyawan (jarang perlu). */
  showEmployees?: boolean;
}) {
  const status = API_STATUS_LABEL[assignment.status];
  const dateRange =
    assignment.startDate === assignment.endDate
      ? formatShortDateNoYear(assignment.startDate)
      : `${formatShortDateNoYear(assignment.startDate)} - ${formatShortDateNoYear(assignment.endDate)}`;

  return (
    <View className="gap-3 rounded-2xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-text">{dateRange}</Text>
        <StatusBadge status={status} />
      </View>

      <View className="flex-row items-center gap-1.5">
        <Icon name="location-outline" size={16} tone="muted" />
        <Text numberOfLines={1} className="flex-1 text-sm text-muted-foreground">
          {assignment.destinationCity} · {TRANSPORTATION_LABEL[assignment.transportation]}
        </Text>
      </View>

      {showEmployees && (
        <View className="flex-row items-start gap-1.5">
          <Icon name="people-outline" size={16} tone="muted" />
          <Text numberOfLines={2} className="flex-1 text-sm text-muted-foreground">
            {assignment.employees.map((employee) => employee.name).join(', ')}
          </Text>
        </View>
      )}

      {assignment.activityDetail.length > 0 && (
        <Text numberOfLines={2} className="text-sm text-muted-foreground">
          {assignment.activityDetail}
        </Text>
      )}

      {assignment.reviewNote && (
        <Text numberOfLines={2} className="text-xs text-muted-foreground">
          Catatan: {assignment.reviewNote}
        </Text>
      )}
    </View>
  );
}
