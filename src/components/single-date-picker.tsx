import { useEffect, useState } from 'react';
import { Modal, Pressable, useColorScheme, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, type DateData } from 'react-native-calendars';

/** Bottom-sheet single-date picker — sama pola Modal/Calendar dengan date-range-picker.tsx,
 * tapi cuma satu tanggal (dipakai formulir data karyawan: tanggal lahir, tanggal masuk, dst). */
type SingleDatePickerProps = {
  visible: boolean;
  value: string | null; // ISO yyyy-MM-dd
  onClose: () => void;
  onApply: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  title?: string;
};

export function SingleDatePicker({
  visible,
  value,
  onClose,
  onApply,
  minDate,
  maxDate,
  title = 'Pilih Tanggal',
}: SingleDatePickerProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [draft, setDraft] = useState<string | null>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  function handleDayPress(day: DateData) {
    setDraft(day.dateString);
  }

  function handleApply() {
    if (!draft) return;
    onApply(draft);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="gap-4 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">
            {title}
          </Text>

          <Calendar
            current={draft ?? undefined}
            minDate={minDate}
            maxDate={maxDate}
            disableAllTouchEventsForDisabledDays
            markedDates={
              draft ? { [draft]: { selected: true, selectedColor: '#3c87f7' } } : {}
            }
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
              disabled={!draft}
              className={
                draft
                  ? 'flex-1 items-center rounded-xl bg-primary py-3'
                  : 'flex-1 items-center rounded-xl bg-muted py-3'
              }>
              <Text
                className={draft ? 'font-medium text-primary-foreground' : 'text-muted-foreground'}>
                Terapkan
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
