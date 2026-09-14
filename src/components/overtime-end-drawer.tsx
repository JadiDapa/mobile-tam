import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

type OvertimeEndDrawerProps = {
  visible: boolean;
  startedAtLabel: string;
  submitting: boolean;
  onClose: () => void;
  /** `endTime` kosong berarti "sekarang". */
  onEnd: (endTime?: string) => void;
};

/** Pilihan selesaikan lembur: langsung sekarang, atau pilih jam selesainya sendiri. */
export function OvertimeEndDrawer({
  visible,
  startedAtLabel,
  submitting,
  onClose,
  onEnd,
}: OvertimeEndDrawerProps) {
  const [endTime, setEndTime] = useState<Date>(() => new Date());
  const [useCustomTime, setUseCustomTime] = useState(false);

  function handleClose() {
    setUseCustomTime(false);
    setEndTime(new Date());
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
        <Pressable
          className="gap-4 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">
            Selesaikan Lembur
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            Lembur dimulai pukul {startedAtLabel}.
          </Text>

          {useCustomTime ? (
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-text">Jam Selesai</Text>
              <DateTimePicker
                value={endTime}
                mode="time"
                presentation="inline"
                onValueChange={(_event, date) => setEndTime(date)}
              />
            </View>
          ) : (
            <Pressable onPress={() => setUseCustomTime(true)} className="items-center py-2">
              <Text className="text-sm text-primary">
                Pilih jam selesai sendiri
              </Text>
            </Pressable>
          )}

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleClose}
              disabled={submitting}
              className="flex-1 items-center rounded-xl bg-muted py-3">
              <Text className="text-text">Batal</Text>
            </Pressable>
            <Pressable
              onPress={() => onEnd(useCustomTime ? formatTime(endTime) : undefined)}
              disabled={submitting}
              className="flex-1 items-center rounded-xl bg-primary py-3">
              <Text className="font-medium text-primary-foreground">
                {useCustomTime ? `Selesai Jam ${formatTime(endTime)}` : 'Selesai Sekarang'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
