import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import { formatHourMinute } from '@/lib/date';
import { canStartOvertimeAt, overtimeStartTimeFor } from '@/lib/overtime';
import { useSettingsQuery } from '@/lib/queries';

type OvertimeStartDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onStart: (startTime: string, reason: string) => void;
};

/**
 * Pilihan mulai lembur: sekarang (jam berjalan), atau pilih jam mulainya sendiri.
 * Batasnya Jam Mulai Lembur Hari Kerja hari ini dari `/api/settings`; server
 * tetap memvalidasi ulang.
 */
export function OvertimeStartDrawer({ visible, onClose, onStart }: OvertimeStartDrawerProps) {
  const settings = useSettingsQuery();
  const [now, setNow] = useState<Date>(() => new Date());
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState<Date>(() => new Date());
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- live clock: refresh immediately on open, then tick every second
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const startTime = useCustomTime ? customTime : now;
  // Selama settings masih dimuat, jangan tampilkan/blokir pakai fallback 18:00 —
  // Lembur Sabtu yang mulai 14:00 bisa tertahan keliru. Server tetap memvalidasi ulang.
  const overtimeStartTime = settings.isPending
    ? null
    : overtimeStartTimeFor(settings.data?.workDays, now);
  const isTooEarly =
    overtimeStartTime !== null && !canStartOvertimeAt(formatHourMinute(startTime), overtimeStartTime);

  function resetForm() {
    setUseCustomTime(false);
    setCustomTime(new Date());
    setReason('');
    setReasonError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit() {
    if (isTooEarly) return;

    if (reason.trim().length < 5) {
      setReasonError('Alasan minimal 5 karakter');
      return;
    }
    setReasonError(null);

    onStart(formatHourMinute(startTime), reason.trim());
    resetForm();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
        <Pressable
          className="gap-4 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">
            Mulai Lembur
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            {overtimeStartTime
              ? `Jam mulai lembur harus pukul ${overtimeStartTime} atau lebih larut.`
              : 'Memuat jam mulai lembur…'}
          </Text>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-text">Waktu Mulai</Text>

            {useCustomTime ? (
              <DateTimePicker
                value={customTime}
                mode="time"
                presentation="inline"
                onValueChange={(_event, date) => setCustomTime(date)}
              />
            ) : (
              <Text className="text-2xl font-bold text-text">{formatHourMinute(now)}</Text>
            )}

            {isTooEarly && (
              <Text className="text-xs text-red-600 dark:text-red-400">
                Jam mulai harus pukul {overtimeStartTime} atau lebih larut
              </Text>
            )}

            <Pressable onPress={() => setUseCustomTime((prev) => !prev)} className="py-1">
              <Text className="text-sm text-primary">
                {useCustomTime ? 'Pakai jam sekarang' : 'Pilih jam mulai sendiri'}
              </Text>
            </Pressable>
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-text">Alasan</Text>
            <FormInput
              value={reason}
              onChangeText={(next) => {
                setReason(next);
                if (reasonError) setReasonError(null);
              }}
              placeholder="Contoh: menyelesaikan laporan bulanan"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
            {reasonError && (
              <Text className="text-xs text-red-600 dark:text-red-400">{reasonError}</Text>
            )}
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center rounded-xl bg-muted py-3">
              <Text className="text-text">Batal</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={isTooEarly}
              className="flex-1 items-center rounded-xl bg-primary py-3 disabled:opacity-50">
              <Text className="font-medium text-primary-foreground">Mulai Lembur</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
