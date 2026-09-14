import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { formatShortDate } from '@/lib/date';
import { useConfirmMissedCheckoutMutation, useUnresolvedCheckoutsQuery } from '@/lib/queries';

const DEFAULT_HOUR = 17;

function defaultTime() {
  const date = new Date();
  date.setHours(DEFAULT_HOUR, 0, 0, 0);
  return date;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Modal pemblokir: muncul di atas layar Beranda kalau ada hari sebelumnya yang
 * sudah absen masuk tapi belum absen pulang. Tidak bisa ditutup tanpa
 * mengonfirmasi — karyawan wajib memutuskan jam pulangnya (default 17:00,
 * bisa diubah) sebelum absen masuk hari ini diizinkan.
 */
export function MissedCheckoutModal() {
  const unresolved = useUnresolvedCheckoutsQuery();
  const confirmMutation = useConfirmMissedCheckoutMutation();
  const [time, setTime] = useState<Date>(defaultTime);
  const [error, setError] = useState<string | null>(null);

  const days = unresolved.data?.days ?? [];
  const visible = days.length > 0;
  const currentDay = days[0];

  if (!visible || !currentDay) return null;

  function handleConfirm() {
    if (!currentDay) return;

    setError(null);
    confirmMutation.mutate(
      { workDate: currentDay, time: formatTime(time) },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setTime(defaultTime());
        },
        onError: () => setError('Gagal mengonfirmasi absen pulang, coba lagi'),
      },
    );
  }

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View className="w-full gap-4 rounded-2xl bg-card p-5">
          <Text className="text-center text-base font-bold text-text">
            Absen Pulang Terlewat
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            Kamu belum absen pulang pada {formatShortDate(currentDay)}. Konfirmasi jam pulangnya
            dulu sebelum absen masuk hari ini.
            {days.length > 1 ? ` (${days.length} hari belum dikonfirmasi)` : ''}
          </Text>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-text">Jam Pulang</Text>
            <DateTimePicker
              value={time}
              mode="time"
              presentation="inline"
              onValueChange={(_event, date) => setTime(date)}
            />
          </View>

          {error && <Text className="text-center text-xs text-red-600 dark:text-red-400">{error}</Text>}

          <Pressable
            onPress={handleConfirm}
            disabled={confirmMutation.isPending}
            className="items-center rounded-xl bg-primary py-3.5">
            <Text className="font-medium text-primary-foreground">
              {confirmMutation.isPending ? 'Menyimpan...' : `Konfirmasi Pulang ${formatTime(time)}`}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
