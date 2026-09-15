import { router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FieldAssignmentApprovalCard } from '@/components/approval/field-assignment-approval-card';
import { LeaveApprovalCard } from '@/components/approval/leave-approval-card';
import { OvertimeApprovalCard } from '@/components/approval/overtime-approval-card';
import { DateRangePicker, type DateRange } from '@/components/date-range-picker';
import { FilterTabs } from '@/components/filter-tabs';
import { Icon, type IoniconsIconName } from '@/components/icon';
import { MonthSeparator } from '@/components/month-separator';
import { StatsRow } from '@/components/stats-row';
import { StatusBadge } from '@/components/status-badge';
import { API_STATUS_LABEL } from '@/constants/status';
import { formatShortDate, formatTime, monthKey, monthLabel } from '@/lib/date';
import {
  type ApprovalLogEntry,
  useMeQuery,
  usePendingFieldAssignmentApprovalsQuery,
  usePendingLeaveApprovalsQuery,
  usePendingOvertimeApprovalsQuery,
  useReviewHistoryQuery,
} from '@/lib/queries';

const TYPE_TABS = ['Semua', 'Izin', 'Lembur', 'Dinas Luar'] as const;
type TypeTab = (typeof TYPE_TABS)[number];

const TYPE_TO_LOG_TYPE: Record<Exclude<TypeTab, 'Semua'>, ApprovalLogEntry['type']> = {
  Izin: 'LEAVE',
  Lembur: 'OVERTIME',
  'Dinas Luar': 'FIELD_ASSIGNMENT',
};

const HISTORY_TYPE_ICON: Record<ApprovalLogEntry['type'], IoniconsIconName> = {
  LEAVE: 'document-text-outline',
  OVERTIME: 'timer-outline',
  FIELD_ASSIGNMENT: 'briefcase-outline',
};

function HistoryCard({ entry }: { entry: ApprovalLogEntry }) {
  return (
    <View className="gap-3 rounded-2xl bg-card p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-text">{entry.requesterName}</Text>
        <StatusBadge status={API_STATUS_LABEL[entry.status]} />
      </View>

      <View className="flex-row items-center gap-1.5">
        <Icon name={HISTORY_TYPE_ICON[entry.type]} size={14} tone="muted" />
        <Text numberOfLines={1} className="flex-1 text-sm text-muted-foreground">
          {entry.summary}
        </Text>
      </View>

      {entry.note && (
        <Text numberOfLines={3} className="text-sm text-muted-foreground">
          Catatan: {entry.note}
        </Text>
      )}

      <Text className="text-xs text-muted-foreground">
        Diputuskan {formatShortDate(entry.reviewedAt.slice(0, 10))}, {formatTime(entry.reviewedAt)}
      </Text>
    </View>
  );
}

export default function ReviewScreen() {
  const me = useMeQuery();
  const role = me.data?.role;

  // Admin tidak lagi ikut approval apa pun — cuma supervisor & manager yang
  // punya giliran (karyawan/admin mengajukan -> supervisor; supervisor
  // mengajukan -> manager). Lihat AGENTS.md perubahan alur approval.
  const canSeeLeave = role === 'SUPERVISOR' || role === 'MANAGER';
  const canSeeOvertime = role === 'SUPERVISOR' || role === 'MANAGER';
  const canSeeFieldAssignment = role === 'MANAGER';
  const canSeeAttendance = role === 'SUPERVISOR' || role === 'MANAGER';

  const visibleTypeTabs = TYPE_TABS.filter((tab) => {
    if (tab === 'Semua') return true;
    if (tab === 'Izin') return canSeeLeave;
    if (tab === 'Lembur') return canSeeOvertime;
    return canSeeFieldAssignment;
  });

  const [typeTab, setTypeTab] = useState<TypeTab>('Semua');
  const [range, setRange] = useState<DateRange>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    return { start, end: today.toISOString().slice(0, 10) };
  });
  const [isPickerOpen, setPickerOpen] = useState(false);

  const showLeave = canSeeLeave && (typeTab === 'Semua' || typeTab === 'Izin');
  const showOvertime = canSeeOvertime && (typeTab === 'Semua' || typeTab === 'Lembur');
  const showFieldAssignment =
    canSeeFieldAssignment && (typeTab === 'Semua' || typeTab === 'Dinas Luar');

  const leave = usePendingLeaveApprovalsQuery(showLeave);
  const overtime = usePendingOvertimeApprovalsQuery(showOvertime);
  const fieldAssignment = usePendingFieldAssignmentApprovalsQuery(showFieldAssignment);

  const history = useReviewHistoryQuery(typeTab === 'Semua' ? undefined : TYPE_TO_LOG_TYPE[typeTab]);

  const items = useMemo(() => {
    type Item = { date: string; status: (typeof API_STATUS_LABEL)[keyof typeof API_STATUS_LABEL]; key: string; node: ReactNode };

    const result: Item[] = [];

    if (showLeave) {
      for (const request of leave.data?.items ?? []) {
        result.push({
          date: request.startDate,
          status: 'Menunggu',
          key: `leave-${request.id}`,
          node: <LeaveApprovalCard request={request} />,
        });
      }
    }

    if (showOvertime) {
      for (const request of overtime.data?.items ?? []) {
        result.push({
          date: request.startAt.slice(0, 10),
          status: 'Menunggu',
          key: `overtime-${request.id}`,
          node: <OvertimeApprovalCard request={request} />,
        });
      }
    }

    if (showFieldAssignment) {
      for (const assignment of fieldAssignment.data?.items ?? []) {
        result.push({
          date: assignment.startDate,
          status: 'Menunggu',
          key: `field-assignment-${assignment.id}`,
          node: <FieldAssignmentApprovalCard assignment={assignment} />,
        });
      }
    }

    for (const entry of history.data?.items ?? []) {
      result.push({
        date: entry.reviewedAt.slice(0, 10),
        status: API_STATUS_LABEL[entry.status],
        key: `history-${entry.id}`,
        node: <HistoryCard entry={entry} />,
      });
    }

    return result;
  }, [
    showLeave,
    showOvertime,
    showFieldAssignment,
    leave.data,
    overtime.data,
    fieldAssignment.data,
    history.data,
  ]);

  const itemsInRange = items
    .filter((item) => item.date >= range.start && item.date <= range.end)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const stats = (['Menunggu', 'Disetujui', 'Ditolak'] as const).map((status) => ({
    label: status,
    value: itemsInRange.filter((item) => item.status === status).length,
  }));

  const isLoading =
    me.isPending ||
    (showLeave && leave.isPending) ||
    (showOvertime && overtime.isPending) ||
    (showFieldAssignment && fieldAssignment.isPending) ||
    history.isPending;

  const isRefreshing =
    (showLeave && leave.isRefetching) ||
    (showOvertime && overtime.isRefetching) ||
    (showFieldAssignment && fieldAssignment.isRefetching) ||
    history.isRefetching;

  let lastMonthKey: string | null = null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              leave.refetch();
              overtime.refetch();
              fieldAssignment.refetch();
              history.refetch();
            }}
          />
        }>
        <View className="gap-4 px-5 pb-5 pt-safe-offset-5">
          <Text className="text-sm text-muted-foreground">
            Pengajuan izin, lembur, dan dinas luar yang jadi giliranmu.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="flex-1 flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
              <Icon name="calendar-outline" size={18} tone="muted" />
              <Text className="text-sm text-text">
                {formatShortDate(range.start)} - {formatShortDate(range.end)}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPickerOpen(true)}
              className="items-center justify-center rounded-xl bg-primary px-4">
              <Text className="text-sm font-medium text-primary-foreground">Filter</Text>
            </Pressable>
          </View>

          <FilterTabs tabs={visibleTypeTabs} active={typeTab} onChange={setTypeTab} />

          <StatsRow items={stats} />

          {canSeeAttendance && (
            <Pressable
              onPress={() => router.push('/approval-attendance-verification')}
              className="flex-row items-center gap-3 rounded-2xl bg-card p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Icon name="shield-checkmark-outline" size={20} tone="primary" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-medium text-text">Verifikasi Absensi</Text>
                <Text className="text-xs text-muted-foreground">Absensi di luar radius kantor</Text>
              </View>
              <Icon name="chevron-forward-outline" size={16} tone="primary" />
            </Pressable>
          )}

          <View className="gap-3">
            {isLoading ? (
              <ActivityIndicator className="py-10" />
            ) : history.isError ? (
              <Pressable
                onPress={() => history.refetch()}
                className="flex-row items-center justify-center gap-2 py-10">
                <Icon name="refresh-outline" size={16} tone="muted" />
                <Text className="text-sm text-muted-foreground">
                  Gagal memuat data, ketuk untuk coba lagi
                </Text>
              </Pressable>
            ) : itemsInRange.length === 0 ? (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada pengajuan untuk filter ini.
              </Text>
            ) : (
              itemsInRange.map((item) => {
                const currentMonthKey = monthKey(item.date);
                const showSeparator = currentMonthKey !== lastMonthKey;
                lastMonthKey = currentMonthKey;

                return (
                  <View key={item.key} className="gap-3">
                    {showSeparator && <MonthSeparator label={monthLabel(item.date)} />}
                    {item.node}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <DateRangePicker
        visible={isPickerOpen}
        value={range}
        onClose={() => setPickerOpen(false)}
        onApply={(next) => {
          setRange(next);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}
