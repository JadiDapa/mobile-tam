import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { MonthYearPicker } from '@/components/month-year-picker';
import { SingleDatePicker } from '@/components/single-date-picker';
import { StatsRow } from '@/components/stats-row';
import {
  RECAP_DAY_STATUS_DOT_CLASSES,
  RECAP_DAY_STATUS_LABEL,
  RECAP_DAY_STATUS_TEXT_CLASSES,
} from '@/constants/status';
import { formatLateDuration, formatLongIndonesianDate, formatTime, monthLabel } from '@/lib/date';
import {
  type AdminDailyRecapItem,
  type AdminMonthlyRecapItem,
  useAdminDailyRecapQuery,
  useAdminMonthlyRecapQuery,
} from '@/lib/queries';

const MODES = ['Harian', 'Bulanan'] as const;
type Mode = (typeof MODES)[number];

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthInput() {
  return todayInput().slice(0, 7);
}

function DailyRow({ item }: { item: AdminDailyRecapItem }) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
      <Avatar name={item.name} imageUri={item.profileImageUrl} size={40} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-medium text-text">
          {item.name}
        </Text>
        <View className="flex-row items-center gap-1.5 pt-0.5">
          <View className={`h-1.5 w-1.5 rounded-full ${RECAP_DAY_STATUS_DOT_CLASSES[item.status]}`} />
          <Text className={`text-xs font-medium ${RECAP_DAY_STATUS_TEXT_CLASSES[item.status]}`}>
            {RECAP_DAY_STATUS_LABEL[item.status]}
          </Text>
        </View>
      </View>
      <View className="items-end gap-0.5">
        {item.checkInTime && (
          <Text className="text-xs text-muted-foreground">{formatTime(item.checkInTime)}</Text>
        )}
        {item.isLate && (
          <Text className="text-xs font-medium text-red-600 dark:text-red-400">
            Telat {formatLateDuration(item.lateMinutes)}
          </Text>
        )}
      </View>
    </View>
  );
}

function MonthlyRow({ item }: { item: AdminMonthlyRecapItem }) {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-3">
      <View className="flex-row items-center gap-3">
        <Avatar name={item.name} imageUri={item.profileImageUrl} size={40} />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-medium text-text">
            {item.name}
          </Text>
          <Text className="text-xs text-muted-foreground">NIP {item.nip || '-'}</Text>
        </View>
      </View>

      <StatsRow
        items={[
          { label: 'Hadir', value: item.totalAttend },
          { label: 'Telat', value: item.lateCount },
          { label: 'Tidak Hadir', value: item.totalNotAttend },
          { label: 'Lembur', value: formatLateDuration(item.totalLemburMinutes) },
        ]}
      />
    </View>
  );
}

export default function RekapanAbsenScreen() {
  const [mode, setMode] = useState<Mode>('Harian');
  const [date, setDate] = useState(todayInput());
  const [month, setMonth] = useState(currentMonthInput());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const daily = useAdminDailyRecapQuery(date);
  const monthly = useAdminMonthlyRecapQuery(month);

  const isDaily = mode === 'Harian';
  const activeQuery = isDaily ? daily : monthly;

  const monthLabelText = useMemo(() => monthLabel(`${month}-01T00:00:00`), [month]);

  return (
    <View className="flex-1 bg-background">
      <View className="gap-4 px-5 pt-safe-offset-5">
        <View className="flex-row gap-1 rounded-2xl bg-muted p-1">
          {MODES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              className={
                item === mode ? 'flex-1 items-center rounded-xl bg-primary py-2' : 'flex-1 items-center rounded-xl py-2'
              }>
              <Text className={item === mode ? 'text-sm font-medium text-primary-foreground' : 'text-sm text-muted-foreground'}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => (isDaily ? setDatePickerOpen(true) : setMonthPickerOpen(true))}
          className="flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
          <Icon name="calendar-outline" size={18} tone="muted" />
          <Text className="text-sm text-text">
            {isDaily ? formatLongIndonesianDate(new Date(`${date}T00:00:00`)) : monthLabelText}
          </Text>
        </Pressable>
      </View>

      {isDaily ? (
        <FlatList
          data={daily.data?.items ?? []}
          keyExtractor={(item) => item.userId}
          contentContainerClassName="gap-3 px-5 pb-5 pt-4"
          refreshControl={<RefreshControl refreshing={daily.isRefetching} onRefresh={() => daily.refetch()} />}
          ListEmptyComponent={
            activeQuery.isPending ? (
              <ActivityIndicator className="py-10" />
            ) : (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                Belum ada data absensi untuk tanggal ini.
              </Text>
            )
          }
          renderItem={({ item }) => <DailyRow item={item} />}
        />
      ) : (
        <FlatList
          data={monthly.data?.items ?? []}
          keyExtractor={(item) => item.userId}
          contentContainerClassName="gap-3 px-5 pb-5 pt-4"
          refreshControl={<RefreshControl refreshing={monthly.isRefetching} onRefresh={() => monthly.refetch()} />}
          ListEmptyComponent={
            activeQuery.isPending ? (
              <ActivityIndicator className="py-10" />
            ) : (
              <Text className="py-10 text-center text-sm text-muted-foreground">
                Belum ada data absensi untuk bulan ini.
              </Text>
            )
          }
          renderItem={({ item }) => <MonthlyRow item={item} />}
        />
      )}

      <SingleDatePicker
        visible={isDatePickerOpen}
        value={date}
        onClose={() => setDatePickerOpen(false)}
        onApply={(next) => {
          setDate(next);
          setDatePickerOpen(false);
        }}
        title="Pilih Tanggal"
      />

      <MonthYearPicker
        visible={isMonthPickerOpen}
        value={month}
        onClose={() => setMonthPickerOpen(false)}
        onApply={(next) => {
          setMonth(next);
          setMonthPickerOpen(false);
        }}
      />
    </View>
  );
}
