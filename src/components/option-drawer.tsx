import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';

/** Generic bottom-sheet single-select drawer — same Modal pattern as leave-type-drawer.tsx,
 * reused for the reason-category and transportation pickers. */
export function OptionDrawer<T extends string>({
  visible,
  title,
  options,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onClose: () => void;
  onSelect: (value: T) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-[70%] gap-2 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="pb-2 text-center text-base font-bold text-text">
            {title}
          </Text>

          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              className="flex-row items-center justify-between rounded-xl bg-muted p-3">
              <Text className="text-sm font-medium text-text">
                {option.label}
              </Text>
              {selected === option.value && (
                <Icon name="checkmark-circle" size={18} tone="primary" />
              )}
            </Pressable>
          ))}

          <Pressable onPress={onClose} className="items-center rounded-xl py-3">
            <Text className="text-sm text-muted-foreground">Batal</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
