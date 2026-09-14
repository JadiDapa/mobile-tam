import { useEffect, useState } from 'react';
import { Modal, Pressable, useColorScheme, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, type DateData } from 'react-native-calendars';

export type DateRange = {
  start: string; // ISO yyyy-MM-dd
  end: string; // ISO yyyy-MM-dd
};

type MarkedDates = Record<
  string,
  { color: string; textColor: string; startingDay?: boolean; endingDay?: boolean }
>;

function buildMarkedDates(start: string | null, end: string | null): MarkedDates {
  if (!start) return {};

  if (!end) {
    return { [start]: { startingDay: true, endingDay: true, color: '#3c87f7', textColor: '#ffffff' } };
  }

  const marked: MarkedDates = {};
  const cursor = new Date(start);
  const endDate = new Date(end);

  while (cursor <= endDate) {
    const iso = cursor.toISOString().slice(0, 10);
    marked[iso] = {
      color: '#3c87f7',
      textColor: '#ffffff',
      startingDay: iso === start,
      endingDay: iso === end,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  return marked;
}

type DateRangePickerProps = {
  visible: boolean;
  value: DateRange;
  onClose: () => void;
  onApply: (range: DateRange) => void;
  /** Tanggal paling awal yang boleh dipilih (ISO yyyy-MM-dd) — dipakai Cuti,
   * yang wajib diajukan minimal 30 hari sebelumnya. Tanggal sebelum ini
   * ditampilkan abu-abu dan tidak bisa ditekan. */
  minDate?: string;
  /** Bulan yang ditampilkan saat kalender pertama dibuka. */
  initialMonth?: string;
};

export function DateRangePicker({
  visible,
  value,
  onClose,
  onApply,
  minDate,
  initialMonth,
}: DateRangePickerProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [draft, setDraft] = useState<{ start: string | null; end: string | null }>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  function handleDayPress(day: DateData) {
    if (minDate && day.dateString < minDate) return;

    if (!draft.start || (draft.start && draft.end)) {
      setDraft({ start: day.dateString, end: null });
      return;
    }

    if (day.dateString < draft.start) {
      setDraft({ start: day.dateString, end: draft.start });
      return;
    }

    setDraft({ start: draft.start, end: day.dateString });
  }

  function handleApply() {
    if (!draft.start) return;
    onApply({ start: draft.start, end: draft.end ?? draft.start });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="gap-4 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">
            Pilih Rentang Tanggal
          </Text>

          <Calendar
            key={initialMonth}
            current={initialMonth}
            minDate={minDate}
            disableAllTouchEventsForDisabledDays
            markingType="period"
            markedDates={buildMarkedDates(draft.start, draft.end)}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              dayTextColor: isDark ? '#ffffff' : '#000000',
              monthTextColor: isDark ? '#ffffff' : '#000000',
              textDisabledColor: isDark ? '#525252' : '#d4d4d4',
              arrowColor: '#3c87f7',
              todayTextColor: '#3c87f7',
            }}
          />

          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 items-center rounded-xl bg-muted py-3">
              <Text className="text-text">Batal</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              disabled={!draft.start}
              className={
                draft.start
                  ? 'flex-1 items-center rounded-xl bg-primary py-3'
                  : 'flex-1 items-center rounded-xl bg-muted py-3'
              }>
              <Text
                className={
                  draft.start
                    ? 'font-medium text-primary-foreground'
                    : 'text-muted-foreground'
                }>
                Terapkan
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
