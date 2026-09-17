import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import { LONG_MONTH_NAMES } from '@/lib/date';

const YEARS_TO_SHOW = 6; // current year + a few years back

type MonthYearPickerProps = {
  visible: boolean;
  /** "YYYY-MM" */
  value: string;
  onClose: () => void;
  onApply: (month: string) => void;
};

/** Bottom-sheet bulan+tahun — sama pola Modal dengan year-picker.tsx, ditambah grid 12 bulan. */
export function MonthYearPicker({ visible, value, onClose, onApply }: MonthYearPickerProps) {
  const [year, month] = value.split('-').map(Number);
  const [draftYear, setDraftYear] = useState(year);
  const [draftMonth, setDraftMonth] = useState(month);

  useEffect(() => {
    if (visible) {
      setDraftYear(year);
      setDraftMonth(month);
    }
  }, [visible, year, month]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_TO_SHOW }, (_, index) => currentYear - index);

  function handleApply() {
    onApply(`${draftYear}-${String(draftMonth).padStart(2, '0')}`);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="gap-4 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">Pilih Bulan</Text>

          <View className="flex-row items-center justify-center gap-4">
            <Pressable
              onPress={() => setDraftYear((current) => current - 1)}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Icon name="chevron-back" size={18} />
            </Pressable>
            <Text className="w-20 text-center text-base font-medium text-text">{draftYear}</Text>
            <Pressable
              onPress={() => setDraftYear((current) => current + 1)}
              disabled={draftYear >= years[0]}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Icon name="chevron-forward" size={18} tone={draftYear >= years[0] ? 'muted' : 'default'} />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {LONG_MONTH_NAMES.map((label, index) => {
              const monthNumber = index + 1;
              const isSelected = monthNumber === draftMonth;

              return (
                <Pressable
                  key={label}
                  onPress={() => setDraftMonth(monthNumber)}
                  className={
                    isSelected
                      ? 'w-[31%] items-center rounded-lg bg-primary py-3'
                      : 'w-[31%] items-center rounded-lg bg-muted py-3'
                  }>
                  <Text
                    className={isSelected ? 'text-sm font-medium text-primary-foreground' : 'text-sm text-text'}>
                    {label.slice(0, 3)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3">
            <Pressable onPress={onClose} className="flex-1 items-center rounded-xl bg-muted py-3">
              <Text className="text-text">Batal</Text>
            </Pressable>
            <Pressable onPress={handleApply} className="flex-1 items-center rounded-xl bg-primary py-3">
              <Text className="font-medium text-primary-foreground">Terapkan</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
