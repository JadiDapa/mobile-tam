import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { ApprovalActions, showApprovalResult } from '@/components/approval/approval-actions';
import { StatColumn } from '@/components/stat-column';
import { StatusBadge } from '@/components/status-badge';
import { API_STATUS_LABEL, LEAVE_REASON_CATEGORY_LABEL, LEAVE_TYPE_LABEL } from '@/constants/status';
import { countDaysInclusive, formatShortDateNoYear } from '@/lib/date';
import { type PendingLeaveRequest, useReviewLeaveMutation } from '@/lib/queries';

export function LeaveApprovalCard({ request }: { request: PendingLeaveRequest }) {
  const review = useReviewLeaveMutation();

  function handleReview(status: 'APPROVED' | 'REJECTED', reviewNote: string) {
    review.mutate(
      { id: request.id, status, reviewNote: reviewNote || undefined },
      { onSuccess: showApprovalResult, onError: () => showApprovalResult({ ok: false, error: 'Terjadi kesalahan, coba lagi' }) },
    );
  }

  return (
    <View className="gap-3 rounded-2xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-text">{request.user.name}</Text>
        <StatusBadge status={API_STATUS_LABEL[request.status]} />
      </View>

      <Text className="text-xs text-muted-foreground">
        {LEAVE_TYPE_LABEL[request.type]}
        {request.reasonCategory ? ` · ${LEAVE_REASON_CATEGORY_LABEL[request.reasonCategory]}` : ''}
      </Text>

      <View className="flex-row">
        <StatColumn label="Mulai" value={formatShortDateNoYear(request.startDate)} />
        <StatColumn label="Selesai" value={formatShortDateNoYear(request.endDate)} divider />
        <StatColumn
          label="Durasi"
          value={`${countDaysInclusive(request.startDate, request.endDate)} Hari`}
          divider
        />
      </View>

      {request.detail.length > 0 && (
        <Text numberOfLines={3} className="text-sm text-muted-foreground">
          {request.detail}
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
