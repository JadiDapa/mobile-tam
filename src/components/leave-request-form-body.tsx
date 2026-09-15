import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { DateRangePicker, type DateRange } from '@/components/date-range-picker';
import { FormInput } from '@/components/form-input';
import { Icon } from '@/components/icon';
import { OptionDrawer } from '@/components/option-drawer';
import {
  CUTI_REASON_CATEGORIES,
  IZIN_REASON_CATEGORIES,
  LEAVE_REASON_CATEGORY_LABEL,
} from '@/constants/status';
import { useCreateLeaveMutation, type LeaveReasonCategory } from '@/lib/queries';

const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export type LeaveFormType = 'Sakit' | 'Izin' | 'Cuti';

const TYPE_TO_ENUM: Record<LeaveFormType, 'SAKIT' | 'IZIN' | 'CUTI'> = {
  Sakit: 'SAKIT',
  Izin: 'IZIN',
  Cuti: 'CUTI',
};

const TYPE_BADGE_CLASSES: Record<LeaveFormType, string> = {
  Sakit: 'bg-orange-100 dark:bg-orange-950',
  Izin: 'bg-amber-100 dark:bg-amber-950',
  Cuti: 'bg-blue-100 dark:bg-blue-950',
};

const TYPE_TEXT_CLASSES: Record<LeaveFormType, string> = {
  Sakit: 'text-orange-600 dark:text-orange-400',
  Izin: 'text-amber-600 dark:text-amber-400',
  Cuti: 'text-blue-600 dark:text-blue-400',
};

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function formatShortDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Cuti wajib diajukan minimal 30 hari sebelum tanggal mulai — samakan dengan
 * CUTI_MIN_ADVANCE_DAYS di dashboard/lib/leave.ts, server yang jadi sumber
 * kebenaran validasinya, ini cuma UI guard di kalender. */
const CUTI_MIN_ADVANCE_DAYS = 30;

function minCutiStartIso() {
  return addDaysIso(todayIso(), CUTI_MIN_ADVANCE_DAYS);
}

/** Izin wajib diajukan minimal 2 hari sebelum tanggal mulai (hari ini dan
 * besok tidak bisa dipilih) — samakan dengan IZIN_MIN_ADVANCE_DAYS di
 * dashboard/lib/leave.ts, server yang jadi sumber kebenaran validasinya,
 * ini cuma UI guard di kalender. */
const IZIN_MIN_ADVANCE_DAYS = 2;

function minIzinStartIso() {
  return addDaysIso(todayIso(), IZIN_MIN_ADVANCE_DAYS);
}

/** Tanggal 1 bulan depan — kecuali masih kurang dari 30 hari dari hari ini,
 * maka dibulatkan maju ke tanggal minimum yang boleh dipilih. */
function defaultCutiStartIso() {
  const today = new Date();
  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 10);
  const minIso = minCutiStartIso();

  return firstOfNextMonth < minIso ? minIso : firstOfNextMonth;
}

type LeaveRequestFormBodyProps = {
  type: LeaveFormType;
  reasonPlaceholder: string;
  /** Only shown for Cuti, where an annual quota makes sense to surface. */
  leaveBalanceLabel?: string;
};

type PickedFile = { uri: string; name: string; mimeType: string };

/** Sakit has no "Alasan" category in the product spec — only Cuti/Izin need one. */
const REASON_CATEGORY_OPTIONS: Record<'Cuti' | 'Izin', LeaveReasonCategory[]> = {
  Cuti: CUTI_REASON_CATEGORIES,
  Izin: IZIN_REASON_CATEGORIES,
};

export function LeaveRequestFormBody({
  type,
  reasonPlaceholder,
  leaveBalanceLabel,
}: LeaveRequestFormBodyProps) {
  const isCuti = type === 'Cuti';
  const isIzin = type === 'Izin';
  const isSakit = type === 'Sakit';
  const cutiMinDate = isCuti ? minCutiStartIso() : undefined;
  const izinMinDate = isIzin ? minIzinStartIso() : undefined;
  const [range, setRange] = useState<DateRange>(() => {
    if (isCuti) return { start: defaultCutiStartIso(), end: defaultCutiStartIso() };
    if (isIzin) return { start: minIzinStartIso(), end: minIzinStartIso() };
    return { start: todayIso(), end: todayIso() };
  });
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [detail, setDetail] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [reasonCategory, setReasonCategory] = useState<LeaveReasonCategory | null>(null);
  const [isCategoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<PickedFile | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const createLeave = useCreateLeaveMutation();

  async function handlePickAttachment() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ATTACHMENT_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    setAttachment({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/octet-stream',
    });
    setAttachmentError(null);
  }

  function handleSubmit() {
    let hasError = false;

    if (detail.trim().length < 5) {
      setReasonError('Detail minimal 5 karakter');
      hasError = true;
    } else {
      setReasonError(null);
    }

    if (!isSakit && !reasonCategory) {
      setCategoryError('Alasan wajib dipilih');
      hasError = true;
    } else {
      setCategoryError(null);
    }

    if (isSakit && !attachment) {
      setAttachmentError('Lampiran wajib diunggah untuk pengajuan Sakit');
      hasError = true;
    } else {
      setAttachmentError(null);
    }

    if (hasError) return;

    const formData = new FormData();
    formData.append('type', TYPE_TO_ENUM[type]);
    formData.append('startDate', range.start);
    formData.append('endDate', range.end);
    formData.append('detail', detail.trim());
    if (!isSakit && reasonCategory) {
      formData.append('reasonCategory', reasonCategory);
    }
    if (attachment) {
      formData.append('attachment', new File(attachment.uri), attachment.name);
    }

    createLeave.mutate(formData, {
      onSuccess: (result) => {
        if (!result.ok) {
          Alert.alert('Gagal Mengirim', result.error);
          return;
        }

        Alert.alert('Pengajuan Terkirim', result.message, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (error) => {
        Alert.alert('Gagal Mengirim', error instanceof Error ? error.message : 'Coba lagi.');
      },
    });
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-5">
        <View className={`self-start rounded-full px-3 py-1 ${TYPE_BADGE_CLASSES[type]}`}>
          <Text className={`text-sm font-medium ${TYPE_TEXT_CLASSES[type]}`}>{type}</Text>
        </View>

        {leaveBalanceLabel && (
          <View className="flex-row items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-950/40">
            <Icon name="information-circle-outline" size={18} tone="primary" />
            <Text className="flex-1 text-sm text-blue-700 dark:text-blue-300">
              Sisa Cuti Tahun Ini: {leaveBalanceLabel}
            </Text>
          </View>
        )}

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Tanggal</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
            <Icon name="calendar-outline" size={18} tone="muted" />
            <Text className="text-sm text-text">
              {formatShortDate(range.start)} - {formatShortDate(range.end)}
            </Text>
          </Pressable>
          {isCuti && (
            <Text className="text-xs text-muted-foreground">
              Cuti wajib diajukan minimal 30 hari sebelum tanggal mulai.
            </Text>
          )}
          {isIzin && (
            <Text className="text-xs text-muted-foreground">
              Izin wajib diajukan minimal 2 hari sebelum tanggal mulai.
            </Text>
          )}
        </View>

        {!isSakit && (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-text">Alasan</Text>
            <Pressable
              onPress={() => setCategoryPickerOpen(true)}
              className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
              <Text className="text-sm text-text">
                {reasonCategory ? LEAVE_REASON_CATEGORY_LABEL[reasonCategory] : 'Pilih alasan...'}
              </Text>
              <Icon name="chevron-down-outline" size={16} tone="primary" />
            </Pressable>
            {categoryError && (
              <Text className="text-xs text-red-600 dark:text-red-400">{categoryError}</Text>
            )}
          </View>
        )}

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Detail</Text>
          <FormInput
            value={detail}
            onChangeText={(next) => {
              setDetail(next);
              if (reasonError) setReasonError(null);
            }}
            placeholder={reasonPlaceholder}
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />
          {reasonError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{reasonError}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">
            {isSakit ? 'Lampiran (wajib)' : 'Lampiran (opsional)'}
          </Text>
          <Pressable
            onPress={handlePickAttachment}
            className="flex-row items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
            <Icon name="attach-outline" size={18} tone="muted" />
            <Text
              numberOfLines={1}
              className="flex-1 text-sm text-muted-foreground">
              {attachment ? attachment.name : 'Pilih File'}
            </Text>
          </Pressable>
          <Text className="text-xs text-muted-foreground">
            Surat dokter atau bukti pendukung — JPG, PNG, WEBP, atau PDF, maks 5MB.
          </Text>
          {attachmentError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{attachmentError}</Text>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createLeave.isPending}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60">
          {createLeave.isPending && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Kirim Pengajuan</Text>
        </Pressable>
      </View>

      <DateRangePicker
        visible={isPickerOpen}
        value={range}
        onClose={() => setPickerOpen(false)}
        onApply={(next) => {
          setRange(next);
          setPickerOpen(false);
        }}
        minDate={cutiMinDate ?? izinMinDate}
        initialMonth={isCuti || isIzin ? range.start : undefined}
      />

      {!isSakit && (
        <OptionDrawer
          visible={isCategoryPickerOpen}
          title="Pilih Alasan"
          options={REASON_CATEGORY_OPTIONS[type as 'Cuti' | 'Izin'].map((category) => ({
            value: category,
            label: LEAVE_REASON_CATEGORY_LABEL[category],
          }))}
          selected={reasonCategory}
          onClose={() => setCategoryPickerOpen(false)}
          onSelect={(value) => {
            setReasonCategory(value);
            setCategoryError(null);
            setCategoryPickerOpen(false);
          }}
        />
      )}
    </ScrollView>
  );
}
