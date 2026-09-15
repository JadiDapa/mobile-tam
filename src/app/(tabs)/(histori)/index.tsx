import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { StatsRow } from "@/components/stats-row";
import {
  AttendanceCard,
  type DayRecord,
  type DayStatus,
} from "@/components/histori/attendance-card";
import {
  eachDateInRange,
  formatDuration,
  formatLateDuration,
  formatShortDate,
  formatTime,
  lateMinutesFor,
} from "@/lib/date";
import {
  useAttendanceHistoryQuery,
  useLeaveRequestsQuery,
  useSettingsQuery,
} from "@/lib/queries";

const TABS: ("Semua" | DayStatus)[] = [
  "Semua",
  "Hadir",
  "Izin",
  "Sakit",
  "Cuti",
];

const WORK_MODE_LABEL: Record<string, string> = {
  HADIR_DIKANTOR: "Kantor Pusat",
  LUAR_RADIUS: "Luar Radius",
};

const LEAVE_TYPE_TO_STATUS: Record<string, DayStatus> = {
  IZIN: "Izin",
  SAKIT: "Sakit",
  CUTI: "Cuti",
};

export default function HistoriScreen() {
  const [range, setRange] = useState<DateRange>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    return { start, end: today.toISOString().slice(0, 10) };
  });
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Semua");

  const attendance = useAttendanceHistoryQuery({
    from: range.start,
    to: range.end,
  });
  const leave = useLeaveRequestsQuery();
  const settings = useSettingsQuery();

  const workDays = settings.data?.workDays ?? [];

  const records = useMemo<DayRecord[]>(() => {
    if (!attendance.data) return [];

    const attendanceByDate = new Map(
      attendance.data.days.map((day) => [day.workDate.slice(0, 10), day]),
    );
    const approvedLeaves = (leave.data?.items ?? []).filter(
      (item) => item.status === "APPROVED",
    );

    return eachDateInRange(range.start, range.end).flatMap(
      (date): DayRecord[] => {
        const day = attendanceByDate.get(date);

        if (day?.checkIn) {
          return [
            {
              date,
              location:
                WORK_MODE_LABEL[day.checkIn.workMode] ?? day.checkIn.workMode,
              status: "Hadir",
              isLate: day.checkIn.isLate,
              lateBy: day.checkIn.isLate
                ? formatLateDuration(
                    lateMinutesFor(day.checkIn.timestamp, date, workDays),
                  )
                : null,
              checkIn: formatTime(day.checkIn.timestamp),
              checkOut: day.checkOut
                ? formatTime(day.checkOut.timestamp)
                : null,
              totalHours:
                day.checkIn && day.checkOut
                  ? formatDuration(
                      day.checkIn.timestamp,
                      day.checkOut.timestamp,
                    )
                  : "--:--",
            },
          ];
        }

        const leaveOnDay = approvedLeaves.find(
          (item) =>
            item.startDate.slice(0, 10) <= date &&
            item.endDate.slice(0, 10) >= date,
        );

        if (leaveOnDay) {
          return [
            {
              date,
              location: "-",
              status: LEAVE_TYPE_TO_STATUS[leaveOnDay.type],
              isLate: false,
              lateBy: null,
              checkIn: null,
              checkOut: null,
              totalHours: "--:--",
            },
          ];
        }

        return [];
      },
    );
  }, [attendance.data, leave.data, range, workDays]);

  const visibleRecords = (
    activeTab === "Semua"
      ? records
      : records.filter((record) => record.status === activeTab)
  )
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const daysInRange = eachDateInRange(range.start, range.end).length;
  const hadirCount = records.filter(
    (record) => record.status === "Hadir",
  ).length;
  const telatCount = records.filter(
    (record) => record.status === "Hadir" && record.isLate,
  ).length;
  const tidakHadirCount = Math.max(daysInRange - records.length, 0);

  const stats = [
    { label: "Hadir", value: hadirCount },
    { label: "Telat", value: telatCount },
    { label: "Tidak Hadir", value: tidakHadirCount },
  ];

  const isLoading = attendance.isPending || leave.isPending;
  const isRefreshing = attendance.isRefetching || leave.isRefetching;
  const onRefresh = () => {
    attendance.refetch();
    leave.refetch();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
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
            {isLoading ? (
              <ActivityIndicator className="py-10" />
            ) : visibleRecords.length === 0 ? (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada data absensi untuk filter ini.
              </Text>
            ) : (
              visibleRecords.map((record) => (
                <AttendanceCard key={record.date} record={record} />
              ))
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
