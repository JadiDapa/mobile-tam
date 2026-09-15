import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";

import {
  DateRangePicker,
  type DateRange,
} from "@/components/date-range-picker";
import { FilterTabs } from "@/components/filter-tabs";
import { Icon } from "@/components/icon";
import { LeaveRequestCard } from "@/components/izin/leave-request-card";
import {
  LeaveTypeDrawer,
  type LeaveRequestType,
} from "@/components/leave-type-drawer";
import { MonthSeparator } from "@/components/month-separator";
import { ReviewedDivider } from "@/components/reviewed-divider";
import { StatsRow } from "@/components/stats-row";
import { LEAVE_TYPE_LABEL } from "@/constants/status";
import { formatShortDate } from "@/lib/date";
import { groupByMonthWithReviewGap } from "@/lib/group-by-month";
import { useLeaveRequestsQuery } from "@/lib/queries";

type LeaveType = "Sakit" | "Izin" | "Cuti";

const TABS: ("Semua" | LeaveType)[] = ["Semua", "Sakit", "Izin", "Cuti"];

export default function IzinScreen() {
  const [range, setRange] = useState<DateRange>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    return { start, end: today.toISOString().slice(0, 10) };
  });
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isTypeDrawerOpen, setTypeDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Semua");

  const leave = useLeaveRequestsQuery();

  function handleSelectType(type: LeaveRequestType) {
    setTypeDrawerOpen(false);

    if (type === "Sakit") router.push("/leave-request-sakit");
    else if (type === "Izin") router.push("/leave-request-izin");
    else router.push("/leave-request-cuti");
  }

  const requestsInRange = useMemo(
    () =>
      (leave.data?.items ?? [])
        .filter((request) => {
          // Pengajuan yang masih menunggu selalu tampil, tidak terpotong filter
          // tanggal — biar tidak "hilang" cuma karena di luar rentang aktif.
          if (request.status === "PENDING") return true;

          const startDate = request.startDate.slice(0, 10);
          const endDate = request.endDate.slice(0, 10);
          return startDate <= range.end && endDate >= range.start;
        })
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    [leave.data, range],
  );

  const visibleRequests =
    activeTab === "Semua"
      ? requestsInRange
      : requestsInRange.filter(
          (request) => LEAVE_TYPE_LABEL[request.type] === activeTab,
        );

  const stats = (["SAKIT", "IZIN", "CUTI"] as const).map((type) => ({
    label: LEAVE_TYPE_LABEL[type],
    value: requestsInRange.filter((request) => request.type === type).length,
  }));

  const monthGroups = useMemo(
    () =>
      groupByMonthWithReviewGap(
        visibleRequests,
        (request) => request.startDate,
        (request) => request.status === "PENDING",
      ),
    [visibleRequests],
  );
  const onRefresh = () => leave.refetch();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={leave.isRefetching}
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
            {leave.isPending ? (
              <ActivityIndicator className="py-10" />
            ) : visibleRequests.length === 0 ? (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada pengajuan untuk filter ini.
              </Text>
            ) : (
              monthGroups.map((group) => (
                <View key={group.key} className="gap-3">
                  <MonthSeparator label={group.label} />

                  {group.pending.map((request) => (
                    <LeaveRequestCard key={request.id} request={request} />
                  ))}

                  {group.pending.length > 0 && group.reviewed.length > 0 && (
                    <ReviewedDivider />
                  )}

                  {group.reviewed.map((request) => (
                    <LeaveRequestCard key={request.id} request={request} />
                  ))}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-border bg-background p-4">
        <Pressable
          onPress={() => setTypeDrawerOpen(true)}
          className="flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5"
        >
          <Icon name="add-outline" size={18} tone="inverse" />
          <Text className="font-medium text-primary-foreground">
            Ajukan Pengajuan
          </Text>
        </Pressable>
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

      <LeaveTypeDrawer
        visible={isTypeDrawerOpen}
        onClose={() => setTypeDrawerOpen(false)}
        onSelect={handleSelectType}
      />
    </View>
  );
}
