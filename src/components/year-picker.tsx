import { FlatList, Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

const YEARS_TO_SHOW = 6; // current year + a few years back

type YearPickerProps = {
  visible: boolean;
  value: number;
  onClose: () => void;
  onSelect: (year: number) => void;
};

export function YearPicker({ visible, value, onClose, onSelect }: YearPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_TO_SHOW }, (_, index) => currentYear - index);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-96 gap-2 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="pb-2 text-center text-base font-bold text-text">
            Pilih Tahun
          </Text>

          <FlatList
            data={years}
            keyExtractor={(year) => String(year)}
            renderItem={({ item: year }) => (
              <Pressable
                onPress={() => onSelect(year)}
                className={
                  year === value
                    ? 'items-center rounded-lg bg-primary py-3'
                    : 'items-center rounded-lg py-3'
                }>
                <Text
                  className={
                    year === value
                      ? 'font-medium text-primary-foreground'
                      : 'text-text'
                  }>
                  {year}
                </Text>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
