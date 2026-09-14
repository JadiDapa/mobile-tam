import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";

import {
  DateRangePicker,
  type DateRange,
} from "@/components/date-range-picker";
import { FilterTabs } from "@/components/filter-tabs";
import { Icon } from "@/components/icon";
import { MonthSeparator } from "@/components/month-separator";
import { OvertimeEndDrawer } from "@/components/overtime-end-drawer";
import { OvertimeStartDrawer } from "@/components/overtime-request-drawer";
import { StatsRow } from "@/components/stats-row";
import {
  OvertimeRequestCard,
  type OvertimeRequest,
} from "@/components/lembur/overtime-request-card";
import { API_STATUS_LABEL, type RequestStatus } from "@/constants/status";
import {
  formatDuration,
  formatShortDate,
  formatTime,
  monthKey,
  monthLabel,
} from "@/lib/date";
import {
  useEndOvertimeMutation,
  useOvertimeHistoryQuery,
  useStartOvertimeMutation,
} from "@/lib/queries";

const TABS: ("Semua" | RequestStatus)[] = [
  "Semua",
  "Menunggu",
  "Disetujui",
  "Ditolak",
];

export default function LemburScreen() {
  const [range, setRange] = useState<DateRange>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    return { start, end: today.toISOString().slice(0, 10) };
  });
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isStartDrawerOpen, setStartDrawerOpen] = useState(false);
  const [isEndDrawerOpen, setEndDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Semua");

  const overtime = useOvertimeHistoryQuery();
  const startMutation = useStartOvertimeMutation();
  const endMutation = useEndOvertimeMutation();

  const items = useMemo(() => overtime.data?.items ?? [], [overtime.data]);
  const runningOvertime =
    items.find((item) => item.endAt === null && item.status !== 'REJECTED') ?? null;

  const onRefresh = () => overtime.refetch();

  function handleStartOvertime(startTime: string, reason: string) {
    startMutation.mutate(
      { startTime, reason },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            Alert.alert("Gagal Mulai Lembur", result.error);
            return;
          }
          setStartDrawerOpen(false);
        },
        onError: () =>
          Alert.alert("Gagal Mulai Lembur", "Terjadi kesalahan, coba lagi"),
      },
    );
  }

  function handleEndOvertime(endTime?: string) {
    endMutation.mutate(
      { endTime },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            Alert.alert("Gagal Checkout", result.error);
            return;
          }
          setEndDrawerOpen(false);
          Alert.alert("Lembur Selesai", result.message);
        },
        onError: () =>
          Alert.alert("Gagal Checkout", "Terjadi kesalahan, coba lagi"),
      },
    );
  }

  const requests: OvertimeRequest[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        date: item.startAt.slice(0, 10),
        start: formatTime(item.startAt),
        end: item.endAt ? formatTime(item.endAt) : "--:--",
        duration: formatDuration(item.startAt, item.endAt),
        reason: item.reason,
        status: API_STATUS_LABEL[item.status],
      })),
    [items],
  );

  const requestsInRange = requests
    .filter((request) => request.date >= range.start && request.date <= range.end)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const visibleRequests =
    activeTab === "Semua"
      ? requestsInRange
      : requestsInRange.filter((request) => request.status === activeTab);

  const stats = (["Menunggu", "Disetujui", "Ditolak"] as const).map(
    (status) => ({
      label: status,
      value: requestsInRange.filter((request) => request.status === status)
        .length,
    }),
  );

  let lastMonthKey: string | null = null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={overtime.isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="gap-4 px-5 pb-5 pt-4">
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="flex-1 flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3"
            >
              <Icon name="calendar-outline" size={18} tone="muted" />
              <Text className="text-sm text-text">
                {formatShortDate(range.start)} - {formatShortDate(range.end)}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPickerOpen(true)}
              className="items-center justify-center rounded-xl bg-primary px-4"
            >
              <Text className="text-sm font-medium text-primary-foreground">
                Filter
              </Text>
            </Pressable>
          </View>

          <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

          <StatsRow items={stats} />

          <Text className="text-sm text-muted-foreground">
            Menampilkan daftar dari {formatShortDate(range.start)} s/d
            {formatShortDate(range.end)}
          </Text>

          <View className="gap-3">
            {overtime.isPending ? (
              <ActivityIndicator className="py-10" />
            ) : overtime.isError ? (
              <Pressable
                onPress={() => overtime.refetch()}
                className="flex-row items-center justify-center gap-2 py-10"
              >
                <Icon name="refresh-outline" size={16} tone="muted" />
                <Text className="text-sm text-muted-foreground">
                  Gagal memuat data lembur, ketuk untuk coba lagi
                </Text>
              </Pressable>
            ) : visibleRequests.length === 0 ? (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada pengajuan lembur untuk filter ini.
              </Text>
            ) : (
              visibleRequests.map((request) => {
                const currentMonthKey = monthKey(request.date);
                const showSeparator = currentMonthKey !== lastMonthKey;
                lastMonthKey = currentMonthKey;

                return (
                  <View key={request.id} className="gap-3">
                    {showSeparator && (
                      <MonthSeparator label={monthLabel(request.date)} />
                    )}
                    <OvertimeRequestCard request={request} />
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-border bg-background p-4">
        {runningOvertime ? (
          <Pressable
            onPress={() => setEndDrawerOpen(true)}
            disabled={endMutation.isPending}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5"
          >
            <View className="h-2 w-2 rounded-full bg-white" />
            <Text numberOfLines={1} className="font-medium text-white">
              Lembur Berjalan • Mulai {formatTime(runningOvertime.startAt)} —
              Checkout
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setStartDrawerOpen(true)}
            disabled={startMutation.isPending}
            className="flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5"
          >
            <Icon name="add-outline" size={18} tone="inverse" />
            <Text className="font-medium text-primary-foreground">
              Ajukan Lembur
            </Text>
          </Pressable>
        )}
      </View>

      <DateRangePicker
        visible={isPickerOpen}
        value={range}
        onClose={() => setPickerOpen(false)}
        onApply={(next) => {
          setRange(next);
          setPickerOpen(false);
        }}
      />

      <OvertimeStartDrawer
        visible={isStartDrawerOpen}
        onClose={() => setStartDrawerOpen(false)}
        onStart={handleStartOvertime}
      />

      {runningOvertime && (
        <OvertimeEndDrawer
          visible={isEndDrawerOpen}
          startedAtLabel={formatTime(runningOvertime.startAt)}
          submitting={endMutation.isPending}
          onClose={() => setEndDrawerOpen(false)}
          onEnd={handleEndOvertime}
        />
      )}
    </View>
  );
}
