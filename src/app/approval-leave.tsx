import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { LeaveApprovalCard } from '@/components/approval/leave-approval-card';
import { MonthSeparator } from '@/components/month-separator';
import { monthKey, monthLabel } from '@/lib/date';
import { usePendingLeaveApprovalsQuery } from '@/lib/queries';

export default function ApprovalLeaveScreen() {
  const leave = usePendingLeaveApprovalsQuery();

  const items = useMemo(
    () =>
      [...(leave.data?.items ?? [])].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
    [leave.data],
  );

  let lastMonthKey: string | null = null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={leave.isRefetching} onRefresh={() => leave.refetch()} />}>
      <View className="gap-3 px-5 pb-5 pt-4">
        {leave.isPending ? (
          <ActivityIndicator className="py-10" />
        ) : items.length === 0 ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada pengajuan izin yang menunggu.
          </Text>
        ) : (
          items.map((request) => {
            const currentMonthKey = monthKey(request.startDate);
            const showSeparator = currentMonthKey !== lastMonthKey;
            lastMonthKey = currentMonthKey;

            return (
              <View key={request.id} className="gap-3">
                {showSeparator && <MonthSeparator label={monthLabel(request.startDate)} />}
                <LeaveApprovalCard request={request} />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
