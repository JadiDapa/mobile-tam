import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { ApiError } from '@/lib/api';
import { formatHourMinute } from '@/lib/date';
import {
  initialPickerTime,
  missedCheckoutTimeError,
  normalizeMissedDays,
} from '@/lib/missed-checkout';
import { useConfirmMissedCheckoutMutation, useUnresolvedCheckoutsQuery } from '@/lib/queries';

/**
 * Modal pemblokir: muncul di atas layar Beranda kalau ada hari sebelumnya yang
 * sudah absen masuk tapi belum absen pulang. Tidak bisa ditutup tanpa
 * mengonfirmasi sebelum absen masuk hari ini diizinkan.
 *
 * Karyawan cukup menekan "Otomatis pukul HH:mm" (Jam Pulang Hari Kerja hari
 * itu, mis. Sabtu 14:00); memilih jam sendiri tetap tersedia kalau pulangnya
 * memang berbeda. Judul menyebut hari yang dikonfirmasi dan jam masuknya
 * ditampilkan, supaya karyawan tidak mengira yang diminta adalah jam sekarang.
 * Jam harus sesudah jam masuk — server mengecek ulang sebagai penentu.
 *
 * Backend lama (tanpa `missedDays`): hari, jam masuk, dan jam otomatis tidak
 * diketahui — modal jatuh ke perilaku lama, server yang memilih jam otomatis.
 */
export function MissedCheckoutModal() {
  const unresolved = useUnresolvedCheckoutsQuery();
  const confirmMutation = useConfirmMissedCheckoutMutation();
  /** null = belum diubah, ikut jam otomatis hari yang sedang dikonfirmasi. */
  const [pickedTime, setPickedTime] = useState<Date | null>(null);
  const [custom, setCustom] = useState(false);
  /** Penolakan saat menekan konfirmasi — dari cek client atau dari server. */
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = normalizeMissedDays(unresolved.data);
  const current = days[0];

  if (!current) return null;

  const busy = confirmMutation.isPending;
  const time = pickedTime ?? initialPickerTime(current);
  const timeLabel = formatHourMinute(time);
  // Jam otomatis bisa jatuh sebelum jam masuk (mis. masuk di hari libur
  // sesudah Jam Pulang) — kalau begitu karyawan wajib memilih jam sendiri.
  const autoError =
    current.autoCheckOutTime === null
      ? null
      : missedCheckoutTimeError(current.autoCheckOutTime, current.checkInTime);
  const showCustom = custom || autoError !== null;
  const timeError = showCustom ? missedCheckoutTimeError(timeLabel, current.checkInTime) : null;

  /** `chosenTime` kosong = otomatis: server memakai Jam Pulang Hari Kerja hari itu. */
  function handleConfirm(chosenTime?: string) {
    if (chosenTime !== undefined) {
      const clientError = missedCheckoutTimeError(chosenTime, current.checkInTime);
      if (clientError) {
        setSubmitError(clientError);
        return;
      }
    }

    setSubmitError(null);
    confirmMutation.mutate(
      { workDate: current.workDate, time: chosenTime },
      {
        onSuccess: (result) => {
          // Defensif: server menolak lewat 400 (→ onError), bukan 200 + ok:false.
          if (!result.ok) {
            setSubmitError(result.error);
            return;
          }
          setPickedTime(null);
          setCustom(false);
        },
        // Penolakan server (400) datang sebagai ApiError — tampilkan pesannya apa adanya.
        onError: (mutationError) =>
          setSubmitError(
            mutationError instanceof ApiError
              ? mutationError.message
              : 'Gagal mengonfirmasi absen pulang, coba lagi',
          ),
      },
    );
  }

  const isLegacy = current.checkInTime === null;
  const title = isLegacy ? 'Absen Pulang Terlewat' : `Absen pulang hari ${current.dayLabel}`;
  const autoLabel =
    current.autoCheckOutTime === null
      ? 'Otomatis (Jam Pulang hari itu)'
      : `Otomatis pukul ${current.autoCheckOutTime}`;

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View className="w-full gap-4 rounded-2xl bg-card p-5">
          <Text className="text-center text-base font-bold text-text">{title}</Text>
          <Text className="text-center text-sm text-muted-foreground">
            {isLegacy
              ? `Kamu belum absen pulang pada ${current.dayLabel}. Konfirmasi jam pulangnya dulu sebelum absen masuk hari ini.`
              : `Kamu absen masuk pukul ${current.checkInTime} tapi belum absen pulang hari itu. Isi jam pulang hari ${current.dayLabel}, bukan jam sekarang, sebelum absen masuk hari ini.`}
            {days.length > 1 ? ` (${days.length} hari belum dikonfirmasi)` : ''}
          </Text>

          {showCustom && (
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-text">
                {isLegacy ? 'Jam Pulang' : `Jam pulang hari ${current.dayLabel}`}
              </Text>
              <DateTimePicker
                value={time}
                mode="time"
                presentation="inline"
                onValueChange={(_event, date) => {
                  setPickedTime(date);
                  setSubmitError(null);
                }}
              />
              {timeError ? (
                <Text className="text-xs text-red-600 dark:text-red-400">{timeError}</Text>
              ) : (
                !isLegacy && (
                  <Text className="text-xs text-muted-foreground">
                    Jam masuk {current.checkInTime}
                  </Text>
                )
              )}
            </View>
          )}

          {submitError && submitError !== timeError && (
            <Text className="text-center text-xs text-red-600 dark:text-red-400">
              {submitError}
            </Text>
          )}

          <Pressable
            onPress={() => handleConfirm(showCustom ? timeLabel : undefined)}
            disabled={busy || timeError !== null}
            className="items-center rounded-xl bg-primary py-3.5 disabled:opacity-60">
            <Text className="font-medium text-primary-foreground">
              {busy ? 'Menyimpan...' : showCustom ? `Konfirmasi Pulang ${timeLabel}` : autoLabel}
            </Text>
          </Pressable>

          {autoError === null && (
            <Pressable
              onPress={() => {
                setCustom((value) => !value);
                setSubmitError(null);
              }}
              disabled={busy}
              className="items-center py-1">
              <Text className="text-sm text-muted-foreground">
                {custom ? 'Pakai otomatis saja' : 'Pilih jam sendiri'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
