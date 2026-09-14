import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { ApprovalActions, showApprovalResult } from '@/components/approval/approval-actions';
import { StatColumn } from '@/components/stat-column';
import { StatusBadge } from '@/components/status-badge';
import { API_STATUS_LABEL } from '@/constants/status';
import { formatDuration, formatTime } from '@/lib/date';
import { type PendingOvertimeRequest, useReviewOvertimeMutation } from '@/lib/queries';

export function OvertimeApprovalCard({ request }: { request: PendingOvertimeRequest }) {
  const review = useReviewOvertimeMutation();

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

      <View className="flex-row">
        <StatColumn label="Mulai" value={formatTime(request.startAt)} />
        <StatColumn
          label="Selesai"
          value={request.endAt ? formatTime(request.endAt) : '--:--'}
          divider
        />
        <StatColumn label="Durasi" value={formatDuration(request.startAt, request.endAt)} divider />
      </View>

      {request.reason.length > 0 && (
        <Text numberOfLines={3} className="text-sm text-muted-foreground">
          {request.reason}
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
