import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { ApprovalActions, showApprovalResult } from '@/components/approval/approval-actions';
import { Icon } from '@/components/icon';
import { StatusBadge } from '@/components/status-badge';
import { API_STATUS_LABEL, TRANSPORTATION_LABEL } from '@/constants/status';
import { formatShortDateNoYear } from '@/lib/date';
import { type FieldAssignmentRecord, useReviewFieldAssignmentMutation } from '@/lib/queries';

export function FieldAssignmentApprovalCard({ assignment }: { assignment: FieldAssignmentRecord }) {
  const review = useReviewFieldAssignmentMutation();

  const dateRange =
    assignment.startDate === assignment.endDate
      ? formatShortDateNoYear(assignment.startDate)
      : `${formatShortDateNoYear(assignment.startDate)} - ${formatShortDateNoYear(assignment.endDate)}`;

  function handleReview(status: 'APPROVED' | 'REJECTED', reviewNote: string) {
    review.mutate(
      { id: assignment.id, status, reviewNote: reviewNote || undefined },
      { onSuccess: showApprovalResult, onError: () => showApprovalResult({ ok: false, error: 'Terjadi kesalahan, coba lagi' }) },
    );
  }

  return (
    <View className="gap-3 rounded-2xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-text">{assignment.createdBy.name}</Text>
        <StatusBadge status={API_STATUS_LABEL[assignment.status]} />
      </View>

      <Text className="text-xs text-muted-foreground">{dateRange}</Text>

      <View className="flex-row items-center gap-1.5">
        <Icon name="location-outline" size={16} tone="muted" />
        <Text numberOfLines={1} className="flex-1 text-sm text-muted-foreground">
          {assignment.destinationCity} · {TRANSPORTATION_LABEL[assignment.transportation]}
        </Text>
      </View>

      <View className="flex-row items-start gap-1.5">
        <Icon name="people-outline" size={16} tone="muted" />
        <Text numberOfLines={2} className="flex-1 text-sm text-muted-foreground">
          {assignment.employees.map((employee) => employee.name).join(', ')}
        </Text>
      </View>

      {assignment.activityDetail.length > 0 && (
        <Text numberOfLines={3} className="text-sm text-muted-foreground">
          {assignment.activityDetail}
        </Text>
      )}

      <ApprovalActions
        submitting={review.isPending}
        onApprove={(note) => handleReview('APPROVED', note)}
        onReject={(note) => handleReview('REJECTED', note)}
      />
    </View>
  );
}
