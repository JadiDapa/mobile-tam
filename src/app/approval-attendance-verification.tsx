import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { showApprovalResult } from '@/components/approval/approval-actions';
import { ReviewNoteDrawer } from '@/components/approval/review-note-drawer';
import { Icon } from '@/components/icon';
import { OptionDrawer } from '@/components/option-drawer';
import { WORK_MODE_LABEL, WORK_MODE_OPTIONS } from '@/constants/status';
import { formatShortDate, formatTime } from '@/lib/date';
import {
  type PendingAttendanceApproval,
  type WorkMode,
  usePendingAttendanceApprovalsQuery,
  useReviewAttendanceMutation,
} from '@/lib/queries';

function AttendanceApprovalCard({ attendance }: { attendance: PendingAttendanceApproval }) {
  const review = useReviewAttendanceMutation();
  const [isModeDrawerOpen, setModeDrawerOpen] = useState(false);
  const [isNoteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [mode, setMode] = useState<WorkMode | null>(null);

  function submit(status: 'APPROVED' | 'REJECTED', reviewNote: string) {
    review.mutate(
      { id: attendance.id, status, mode: status === 'APPROVED' ? (mode ?? undefined) : undefined, reviewNote: reviewNote || undefined },
      {
        onSuccess: showApprovalResult,
        onError: () => showApprovalResult({ ok: false, error: 'Terjadi kesalahan, coba lagi' }),
      },
    );
    setNoteDrawerOpen(false);
    setAction(null);
    setMode(null);
  }

  return (
    <View className="gap-3 rounded-2xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-text">{attendance.user.name}</Text>
        <Text className="text-xs text-muted-foreground">
          {attendance.type === 'CHECK_IN' ? 'Absen Masuk' : 'Absen Pulang'}
        </Text>
      </View>

      <Text className="text-xs text-muted-foreground">
        {formatShortDate(attendance.workDate)} · {formatTime(attendance.timestamp)}
      </Text>

      {attendance.workModeDetail && (
        <Text numberOfLines={3} className="text-sm text-muted-foreground">
          {attendance.workModeDetail}
        </Text>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => {
            setAction('reject');
            setNoteDrawerOpen(true);
          }}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-destructive py-2.5">
          <Icon name="close-outline" size={16} tone="destructive" />
          <Text className="text-sm font-medium text-destructive">Tolak</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setAction('approve');
            setModeDrawerOpen(true);
          }}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5">
          <Icon name="checkmark-outline" size={16} tone="inverse" />
          <Text className="text-sm font-medium text-primary-foreground">Setujui</Text>
        </Pressable>
      </View>

      <OptionDrawer
        visible={isModeDrawerOpen}
        title="Setujui sebagai"
        options={WORK_MODE_OPTIONS.map((value) => ({ value, label: WORK_MODE_LABEL[value] }))}
        selected={mode}
        onClose={() => {
          setModeDrawerOpen(false);
          setAction(null);
        }}
        onSelect={(value) => {
          setMode(value);
          setModeDrawerOpen(false);
          setNoteDrawerOpen(true);
        }}
      />

      <ReviewNoteDrawer
        visible={isNoteDrawerOpen}
        title={action === 'approve' ? 'Setujui absensi?' : 'Tolak absensi?'}
        confirmLabel={action === 'approve' ? 'Setujui' : 'Tolak'}
        destructive={action === 'reject'}
        submitting={review.isPending}
        onClose={() => {
          setNoteDrawerOpen(false);
          setAction(null);
          setMode(null);
        }}
        onConfirm={(note) => submit(action === 'approve' ? 'APPROVED' : 'REJECTED', note)}
      />
    </View>
  );
}

export default function ApprovalAttendanceVerificationScreen() {
  const attendance = usePendingAttendanceApprovalsQuery();

  const items = useMemo(
    () => [...(attendance.data?.items ?? [])].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
    [attendance.data],
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={attendance.isRefetching} onRefresh={() => attendance.refetch()} />
      }>
      <View className="gap-3 px-5 pb-5 pt-4">
        {attendance.isPending ? (
          <ActivityIndicator className="py-10" />
        ) : items.length === 0 ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada absensi luar radius yang menunggu.
          </Text>
        ) : (
          items.map((item) => <AttendanceApprovalCard key={item.id} attendance={item} />)
        )}
      </View>
    </ScrollView>
  );
}
