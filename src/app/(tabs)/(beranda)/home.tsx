import { router } from "expo-router";
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

import { MenuGrid } from "@/components/beranda/menu-grid";
import { RequestListGroup } from "@/components/beranda/request-card";
import { SectionHeader } from "@/components/beranda/section-header";
import { AttendanceTimeItem } from "@/components/attendance-time-item";
import { Avatar } from "@/components/avatar";
import {
  AttendanceCard,
  type DayRecord,
} from "@/components/histori/attendance-card";
import { Icon } from "@/components/icon";
import { MissedCheckoutModal } from "@/components/missed-checkout-modal";
import { NotificationBadge } from "@/components/notification-badge";
import { OvertimeEndDrawer } from "@/components/overtime-end-drawer";
import { OvertimeStartDrawer } from "@/components/overtime-request-drawer";
import { Card } from "@/components/ui/card";
import {
  API_STATUS_LABEL,
  LEAVE_TYPE_LABEL,
  WORK_MODE_LABEL,
} from "@/constants/status";
import {
  formatDuration,
  formatLateDuration,
  formatLongIndonesianDate,
  formatTime,
} from "@/lib/date";
import {
  useAttendanceHistoryQuery,
  useEndOvertimeMutation,
  useFaceStatusQuery,
  useFieldAssignmentsQuery,
  useLeaveRequestsQuery,
  useMeQuery,
  useOvertimeHistoryQuery,
  usePendingReviewCount,
  useSettingsQuery,
  useStartOvertimeMutation,
} from "@/lib/queries";

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/** Sudah lewat jam pulang terjadwal hari ini — cuma jadi peringatan di UI, aturannya ditegakkan di server. */
function isCheckInClosed(
  workDays: {
    dayOfWeek: number;
    isWorkingDay: boolean;
    checkOutTime: string;
  }[],
  now: Date,
) {
  const today = workDays.find((day) => day.dayOfWeek === now.getDay());
  if (!today || !today.isWorkingDay) return false;

  const end = parseTimeToMinutes(today.checkOutTime);
  if (end === null) return false;

  return now.getHours() * 60 + now.getMinutes() >= end;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function BerandaScreen() {
  const [isStartDrawerOpen, setStartDrawerOpen] = useState(false);
  const [isEndDrawerOpen, setEndDrawerOpen] = useState(false);

  const me = useMeQuery();
  const pendingReviewCount = usePendingReviewCount();
  const month = useAttendanceHistoryQuery(); // default: bulan berjalan
  const leave = useLeaveRequestsQuery();
  const overtime = useOvertimeHistoryQuery();
  const fieldAssignment = useFieldAssignmentsQuery();
  const faceStatus = useFaceStatusQuery();
  const settings = useSettingsQuery();
  const startOvertimeMutation = useStartOvertimeMutation();
  const endOvertimeMutation = useEndOvertimeMutation();

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = month.data?.days.find(
    (day) => day.workDate.slice(0, 10) === today,
  );

  const todayCheckIn = todayRecord?.checkIn?.timestamp ?? null;
  const todayCheckOut = todayRecord?.checkOut?.timestamp ?? null;

  const hasCheckedIn = todayCheckIn !== null;
  const hasCheckedOut = todayCheckOut !== null;

  const isTodayLate = todayRecord?.checkIn?.isLate ?? false;
  const todayLateMinutes = todayRecord?.checkIn?.lateMinutes ?? 0;
  const todayLateLabel =
    todayLateMinutes > 0 ? formatLateDuration(todayLateMinutes) : null;

  const todaysOvertime = useMemo(
    () =>
      (overtime.data?.items ?? []).filter(
        (item) =>
          item.startAt.slice(0, 10) === today && item.status !== "REJECTED",
      ),
    [overtime.data, today],
  );
  const runningOvertime =
    todaysOvertime.find((item) => item.endAt === null) ?? null;
  const completedOvertimeToday = runningOvertime
    ? null
    : (todaysOvertime.find((item) => item.endAt !== null) ?? null);

  function handleStartOvertime(startTime: string, reason: string) {
    startOvertimeMutation.mutate(
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
    endOvertimeMutation.mutate(
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

  const attendanceType: "CHECK_IN" | "CHECK_OUT" = !hasCheckedIn
    ? "CHECK_IN"
    : "CHECK_OUT";
  const notEnrolled = faceStatus.data ? !faceStatus.data.enrolled : false;
  const checkInClosed = settings.data
    ? isCheckInClosed(settings.data.workDays, new Date())
    : false;

  const actionButton = notEnrolled
    ? { label: "Daftarkan Wajah Dulu", disabled: false }
    : !hasCheckedIn
      ? checkInClosed
        ? { label: "Absen Masuk Sudah Ditutup", disabled: true }
        : { label: "Absen Masuk", disabled: false }
      : !hasCheckedOut
        ? { label: "Absen Pulang", disabled: false }
        : { label: "Absensi Hari Ini Selesai", disabled: true };

  const monthStats = useMemo(() => {
    const days = month.data?.days ?? [];
    return {
      totalHadir: days.filter((d) => d.checkIn).length,
      telat: days.filter((d) => d.checkIn?.isLate).length,
    };
  }, [month.data]);

  const recentAttendance = useMemo<DayRecord[]>(
    () =>
      (month.data?.days ?? [])
        .filter((d) => d.checkIn)
        .slice(0, 3)
        .map((d) => ({
          date: d.workDate.slice(0, 10),
          location: d.checkIn
            ? (WORK_MODE_LABEL[
                d.checkIn.workMode as keyof typeof WORK_MODE_LABEL
              ] ?? d.checkIn.workMode)
            : "-",
          status: "Hadir",
          isLate: d.checkIn?.isLate ?? false,
          lateBy:
            d.checkIn && d.checkIn.lateMinutes > 0
              ? formatLateDuration(d.checkIn.lateMinutes)
              : null,
          checkIn: d.checkIn ? formatTime(d.checkIn.timestamp) : null,
          checkOut: d.checkOut ? formatTime(d.checkOut.timestamp) : null,
          totalHours:
            d.checkIn && d.checkOut
              ? formatDuration(d.checkIn.timestamp, d.checkOut.timestamp)
              : "--:--",
        })),
    [month.data],
  );

  const leaveRequestCards = useMemo(
    () =>
      (leave.data?.items ?? []).slice(0, 5).map((item) => ({
        id: item.id,
        subtitle: LEAVE_TYPE_LABEL[item.type],
        title: item.detail,
        date: item.startDate,
        status: API_STATUS_LABEL[item.status],
      })),
    [leave.data],
  );

  const overtimeCards = useMemo(
    () =>
      (overtime.data?.items ?? []).slice(0, 5).map((item) => ({
        id: item.id,
        title: item.reason,
        date: item.startAt,
        status: API_STATUS_LABEL[item.status],
      })),
    [overtime.data],
  );

  const fieldAssignmentCards = useMemo(
    () =>
      (fieldAssignment.data?.items ?? []).slice(0, 5).map((item) => ({
        id: item.id,
        title: item.activityDetail,
        date: item.startDate,
        status: API_STATUS_LABEL[item.status],
      })),
    [fieldAssignment.data],
  );

  const user = me.data;

  const isRefreshing =
    me.isRefetching ||
    month.isRefetching ||
    leave.isRefetching ||
    overtime.isRefetching ||
    fieldAssignment.isRefetching;
  const onRefresh = () => {
    me.refetch();
    month.refetch();
    leave.refetch();
    overtime.refetch();
    fieldAssignment.refetch();
  };

  return (
    <View className="flex-1 bg-background">
      <MissedCheckoutModal />

      {/* Full-bleed brand-color band, like the inspiration's colored header block */}

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="bg-primary px-5 pb-24 pt-safe-offset-7">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <Avatar name={user?.name ?? ""} imageUri={user?.profileImageUrl ?? null} />

              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-xs text-primary-foreground/70"
                >
                  {greeting()},
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-base font-bold text-primary-foreground"
                >
                  {user?.name ?? "..."}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/notifications")}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15"
            >
              <Icon name="notifications-outline" size={20} color="#ffffff" />
              <NotificationBadge count={pendingReviewCount} />
            </Pressable>
          </View>
        </View>

        <View className="gap-8 px-5 pb-8">
          <View className="-mt-20">
            <Card className="gap-5 p-5">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-sm font-medium text-muted-foreground">
                  {formatLongIndonesianDate(new Date())}
                </Text>

                {settings.data?.officeLocation && (
                  <View className="flex-row items-center gap-1">
                    <Icon name="location-outline" size={14} tone="muted" />
                    <Text
                      numberOfLines={1}
                      className="max-w-35 text-xs text-muted-foreground"
                    >
                      {settings.data.officeLocation.name}
                    </Text>
                  </View>
                )}
              </View>

              {month.isPending ? (
                <ActivityIndicator />
              ) : month.isError ? (
                <Pressable
                  onPress={() => month.refetch()}
                  className="flex-row items-center justify-center gap-2 py-2"
                >
                  <Icon name="refresh-outline" size={16} tone="muted" />
                  <Text className="text-sm text-muted-foreground">
                    Gagal memuat data absensi, ketuk untuk coba lagi
                  </Text>
                </Pressable>
              ) : (
                <View className="gap-3">
                  <View className="flex-row items-stretch">
                    <AttendanceTimeItem
                      label="Check In"
                      value={
                        todayCheckIn ? formatTime(todayCheckIn) : "--:--"
                      }
                      tone={
                        isTodayLate
                          ? "danger"
                          : todayCheckIn
                            ? "primary"
                            : "muted"
                      }
                    />
                    <View className="w-px border-l border-dashed border-border" />
                    <AttendanceTimeItem
                      label="Check Out"
                      value={
                        todayCheckOut ? formatTime(todayCheckOut) : "--:--"
                      }
                      tone={todayCheckOut ? "primary" : "muted"}
                    />
                    <View className="w-px border-l border-dashed border-border" />
                    <AttendanceTimeItem
                      label="Total Jam"
                      value={formatDuration(todayCheckIn, todayCheckOut)}
                    />
                  </View>

                  {isTodayLate && (
                    <View className="flex-row items-center justify-center gap-1.5 self-center rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-500/15">
                      <Icon name="alert-circle-outline" size={14} tone="destructive" />
                      <Text className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Terlambat{todayLateLabel ? ` ${todayLateLabel}` : ""}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <Pressable
                onPress={() =>
                  notEnrolled
                    ? router.push("/face-enrollment")
                    : router.push({
                        pathname: "/attendance-capture",
                        params: { type: attendanceType },
                      })
                }
                disabled={actionButton.disabled}
                className={
                  actionButton.disabled
                    ? "rounded-full bg-muted py-4"
                    : "rounded-full bg-primary py-4"
                }
              >
                <Text
                  className={
                    actionButton.disabled
                      ? "text-center font-medium text-muted-foreground"
                      : "text-center font-semibold text-primary-foreground"
                  }
                >
                  {actionButton.label}
                </Text>
              </Pressable>
            </Card>

            {hasCheckedOut && (
              <Card className="gap-5 bg-accent p-5 dark:bg-primary/70">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="text-sm font-medium text-muted-foreground">
                    Lembur
                  </Text>

                  {runningOvertime && (
                    <View className="flex-row items-center gap-1.5">
                      <View className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <Text className="text-xs font-medium text-amber-600">
                        Berjalan
                      </Text>
                    </View>
                  )}

                  {completedOvertimeToday && (
                    <Text className="text-xs font-medium text-muted-foreground">
                      {API_STATUS_LABEL[completedOvertimeToday.status]}
                    </Text>
                  )}
                </View>

                {(runningOvertime || completedOvertimeToday) && (
                  <View className="flex-row items-stretch">
                    <AttendanceTimeItem
                      label="Check In"
                      value={formatTime(
                        (runningOvertime ?? completedOvertimeToday)!.startAt,
                      )}
                    />
                    <View className="w-px border-l border-dashed border-border" />
                    <AttendanceTimeItem
                      label="Check Out"
                      value={
                        completedOvertimeToday?.endAt
                          ? formatTime(completedOvertimeToday.endAt)
                          : "--:--"
                      }
                      tone={completedOvertimeToday?.endAt ? "default" : "muted"}
                    />
                    <View className="w-px border-l border-dashed border-border" />
                    <AttendanceTimeItem
                      label="Total Jam"
                      value={formatDuration(
                        (runningOvertime ?? completedOvertimeToday)!.startAt,
                        completedOvertimeToday?.endAt ??
                          new Date().toISOString(),
                      )}
                    />
                  </View>
                )}

                {runningOvertime ? (
                  <Pressable
                    onPress={() => setEndDrawerOpen(true)}
                    disabled={endOvertimeMutation.isPending}
                    className="flex-row items-center justify-center gap-2 rounded-full bg-amber-600 py-4"
                  >
                    <Text
                      numberOfLines={1}
                      className="font-semibold text-white"
                    >
                      Checkout Lembur
                    </Text>
                  </Pressable>
                ) : completedOvertimeToday ? (
                  <View className="rounded-full bg-muted py-4">
                    <Text className="text-center font-medium text-muted-foreground">
                      Lembur Hari Ini Selesai
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setStartDrawerOpen(true)}
                    disabled={startOvertimeMutation.isPending}
                    className="flex-row items-center justify-center gap-1.5 rounded-full bg-primary py-4"
                  >
                    <Icon name="add-outline" size={18} tone="inverse" />
                    <Text className="font-semibold text-primary-foreground">
                      Ajukan Lembur
                    </Text>
                  </Pressable>
                )}
              </Card>
            )}
          </View>

          {/* Monthly summary — supporting context, lighter weight than the hero */}
          {/* <View className="gap-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Ringkasan Bulan Ini
            </Text>
            <View className="flex-row">
              <StatItem
                label="Hari Hadir"
                value={String(monthStats.totalHadir)}
              />
              <StatItem label="Terlambat" value={String(monthStats.telat)} />
            </View>
          </View> */}

          <MenuGrid />

          <View className="gap-3">
            <SectionHeader
              title="Absen Terakhir"
              count={recentAttendance.length}
              onSeeAll={() => router.push("/(tabs)/(histori)")}
            />

            {recentAttendance.length === 0 ? (
              <Card className="px-4">
                <Text className="py-5 text-sm text-muted-foreground">
                  Belum ada absensi bulan ini.
                </Text>
              </Card>
            ) : (
              <View className="gap-3">
                {recentAttendance.map((record) => (
                  <AttendanceCard key={record.date} record={record} />
                ))}
              </View>
            )}
          </View>

          <View className="gap-3">
            <SectionHeader
              title="Pengajuan Izin & Sakit"
              count={leaveRequestCards.length}
              onSeeAll={() => router.push("/(tabs)/(izin)")}
            />
            <RequestListGroup
              items={leaveRequestCards}
              icon="document-text-outline"
              emptyLabel="Belum ada pengajuan izin/sakit/cuti."
            />
          </View>

          <View className="gap-3">
            <SectionHeader
              title="Pengajuan Lembur"
              count={overtimeCards.length}
              onSeeAll={() => router.push("/(tabs)/(lembur)")}
            />
            <RequestListGroup
              items={overtimeCards}
              icon="time-outline"
              emptyLabel="Belum ada pengajuan lembur."
            />
          </View>

          <View className="gap-3">
            <SectionHeader
              title="Pengajuan Dinas Luar"
              count={fieldAssignmentCards.length}
              onSeeAll={() => router.push("/dinas-luar")}
            />
            <RequestListGroup
              items={fieldAssignmentCards}
              icon="briefcase-outline"
              emptyLabel="Belum ada penugasan dinas luar."
            />
          </View>
        </View>
      </ScrollView>

      <OvertimeStartDrawer
        visible={isStartDrawerOpen}
        onClose={() => setStartDrawerOpen(false)}
        onStart={handleStartOvertime}
      />

      {runningOvertime && (
        <OvertimeEndDrawer
          visible={isEndDrawerOpen}
          startedAtLabel={formatTime(runningOvertime.startAt)}
          submitting={endOvertimeMutation.isPending}
          onClose={() => setEndDrawerOpen(false)}
          onEnd={handleEndOvertime}
        />
      )}
    </View>
  );
}
