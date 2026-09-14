import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FieldAssignmentApprovalCard } from '@/components/approval/field-assignment-approval-card';
import { usePendingFieldAssignmentApprovalsQuery } from '@/lib/queries';

export default function ApprovalFieldAssignmentScreen() {
  const fieldAssignment = usePendingFieldAssignmentApprovalsQuery();

  const items = useMemo(
    () =>
      [...(fieldAssignment.data?.items ?? [])].sort((a, b) =>
        a.startDate < b.startDate ? -1 : 1,
      ),
    [fieldAssignment.data],
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={fieldAssignment.isRefetching}
          onRefresh={() => fieldAssignment.refetch()}
        />
      }>
      <View className="gap-3 px-5 pb-5 pt-4">
        {fieldAssignment.isPending ? (
          <ActivityIndicator className="py-10" />
        ) : items.length === 0 ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada penugasan dinas luar yang menunggu.
          </Text>
        ) : (
          items.map((assignment) => (
            <FieldAssignmentApprovalCard key={assignment.id} assignment={assignment} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
