import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { OvertimeApprovalCard } from '@/components/approval/overtime-approval-card';
import { MonthSeparator } from '@/components/month-separator';
import { monthKey, monthLabel } from '@/lib/date';
import { usePendingOvertimeApprovalsQuery } from '@/lib/queries';

export default function ApprovalOvertimeScreen() {
  const overtime = usePendingOvertimeApprovalsQuery();

  const items = useMemo(
    () => [...(overtime.data?.items ?? [])].sort((a, b) => (a.startAt < b.startAt ? -1 : 1)),
    [overtime.data],
  );

  let lastMonthKey: string | null = null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={overtime.isRefetching} onRefresh={() => overtime.refetch()} />
      }>
      <View className="gap-3 px-5 pb-5 pt-4">
        {overtime.isPending ? (
          <ActivityIndicator className="py-10" />
        ) : items.length === 0 ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada pengajuan lembur yang menunggu.
          </Text>
        ) : (
          items.map((request) => {
            const currentMonthKey = monthKey(request.startAt);
            const showSeparator = currentMonthKey !== lastMonthKey;
            lastMonthKey = currentMonthKey;

            return (
              <View key={request.id} className="gap-3">
                {showSeparator && <MonthSeparator label={monthLabel(request.startAt)} />}
                <OvertimeApprovalCard request={request} />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
