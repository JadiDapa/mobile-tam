import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FieldAssignmentCard } from '@/components/field-assignment-card';
import { Icon } from '@/components/icon';
import { MonthSeparator } from '@/components/month-separator';
import { ReviewedDivider } from '@/components/reviewed-divider';
import { groupByMonthWithReviewGap } from '@/lib/group-by-month';
import { useFieldAssignmentsQuery, useMeQuery } from '@/lib/queries';

export default function DinasLuarScreen() {
  const me = useMeQuery();
  const assignments = useFieldAssignmentsQuery();

  const isSupervisor = me.data?.role === 'SUPERVISOR';
  const items = useMemo(
    () =>
      [...(assignments.data?.items ?? [])].sort((a, b) =>
        a.startDate < b.startDate ? 1 : -1,
      ),
    [assignments.data],
  );
  const monthGroups = useMemo(
    () =>
      groupByMonthWithReviewGap(
        items,
        (assignment) => assignment.startDate,
        (assignment) => assignment.status === 'PENDING',
      ),
    [items],
  );
  const onRefresh = () => assignments.refetch();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={assignments.isRefetching} onRefresh={onRefresh} />
        }>
        <View className="gap-4 px-5 pb-5 pt-safe-offset-5">
          <Text className="text-sm text-muted-foreground">
            {isSupervisor
              ? 'Penugasan dinas luar yang kamu buat.'
              : 'Penugasan dinas luar yang menugaskan kamu.'}
          </Text>

          <View className="gap-3">
            {assignments.isPending ? (
              <ActivityIndicator className="py-10" />
            ) : items.length === 0 ? (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                {isSupervisor
                  ? 'Belum ada penugasan yang kamu buat.'
                  : 'Belum ada penugasan dinas luar untukmu.'}
              </Text>
            ) : (
              monthGroups.map((group) => (
                <View key={group.key} className="gap-3">
                  <MonthSeparator label={group.label} />

                  {group.pending.map((assignment) => (
                    <FieldAssignmentCard key={assignment.id} assignment={assignment} />
                  ))}

                  {group.pending.length > 0 && group.reviewed.length > 0 && (
                    <ReviewedDivider />
                  )}

                  {group.reviewed.map((assignment) => (
                    <FieldAssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {isSupervisor && (
        <View className="border-t border-border bg-background p-4">
          <Pressable
            onPress={() => router.push('/field-assignment-create')}
            className="flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5">
            <Icon name="add-outline" size={18} tone="inverse" />
            <Text className="font-medium text-primary-foreground">Buat Penugasan</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
