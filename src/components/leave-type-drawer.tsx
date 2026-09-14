import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, type IoniconsIconName } from '@/components/icon';

export type LeaveRequestType = 'Sakit' | 'Izin' | 'Cuti';

const OPTIONS: { type: LeaveRequestType; icon: IoniconsIconName; description: string }[] = [
  { type: 'Sakit', icon: 'medkit-outline', description: 'Tidak masuk karena sakit' },
  { type: 'Izin', icon: 'document-text-outline', description: 'Izin keperluan pribadi/mendadak' },
  { type: 'Cuti', icon: 'airplane-outline', description: 'Cuti tahunan terjadwal' },
];

type LeaveTypeDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: LeaveRequestType) => void;
};

export function LeaveTypeDrawer({ visible, onClose, onSelect }: LeaveTypeDrawerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="gap-2 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="pb-2 text-center text-base font-bold text-text">
            Ajukan Pengajuan
          </Text>

          {OPTIONS.map((option) => (
            <Pressable
              key={option.type}
              onPress={() => onSelect(option.type)}
              className="flex-row items-center gap-3 rounded-xl bg-muted p-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Icon name={option.icon} size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text">
                  {option.type}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-xs text-muted-foreground">
                  {option.description}
                </Text>
              </View>
              <Icon name="chevron-forward-outline" size={16} tone="primary" />
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
