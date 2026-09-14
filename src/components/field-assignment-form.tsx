import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { DateRangePicker, type DateRange } from '@/components/date-range-picker';
import { EmployeeMultiSelect } from '@/components/employee-multi-select';
import { FormInput } from '@/components/form-input';
import { Icon } from '@/components/icon';
import { OptionDrawer } from '@/components/option-drawer';
import { TRANSPORTATION_LABEL, TRANSPORTATION_OPTIONS } from '@/constants/status';
import {
  useCreateFieldAssignmentMutation,
  useEmployeesQuery,
  type Employee,
  type TransportationType,
} from '@/lib/queries';

const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

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

type PickedFile = { uri: string; name: string; mimeType: string };

export function FieldAssignmentForm() {
  const employeesQuery = useEmployeesQuery();
  const createMutation = useCreateFieldAssignmentMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(() => ({ start: todayIso(), end: todayIso() }));
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [activityDetail, setActivityDetail] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<PickedFile | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const [destinationCity, setDestinationCity] = useState('');
  const [destinationCityError, setDestinationCityError] = useState<string | null>(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationAddressError, setDestinationAddressError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState('');
  const [purposeError, setPurposeError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [transportation, setTransportation] = useState<TransportationType | null>(null);
  const [transportationError, setTransportationError] = useState<string | null>(null);
  const [isTransportationPickerOpen, setTransportationPickerOpen] = useState(false);
  const [transportationOther, setTransportationOther] = useState('');
  const [transportationOtherError, setTransportationOtherError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedCostError, setEstimatedCostError] = useState<string | null>(null);

  const employees = employeesQuery.data?.items ?? [];
  const selectedEmployees = employees.filter((employee: Employee) =>
    selectedIds.includes(employee.id),
  );

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

    if (selectedIds.length === 0) {
      Alert.alert('Pilih Karyawan', 'Pilih minimal satu karyawan untuk ditugaskan.');
      hasError = true;
    }

    if (activityDetail.trim().length < 5) {
      setReasonError('Kegiatan/Tujuan minimal 5 karakter');
      hasError = true;
    } else {
      setReasonError(null);
    }

    if (destinationCity.trim().length === 0) {
      setDestinationCityError('Tujuan kota wajib diisi');
      hasError = true;
    } else {
      setDestinationCityError(null);
    }

    if (destinationAddress.trim().length === 0) {
      setDestinationAddressError('Lokasi/alamat tujuan wajib diisi');
      hasError = true;
    } else {
      setDestinationAddressError(null);
    }

    if (purpose.trim().length === 0) {
      setPurposeError('Keperluan dinas wajib diisi');
      hasError = true;
    } else {
      setPurposeError(null);
    }

    if (!transportation) {
      setTransportationError('Transportasi wajib dipilih');
      hasError = true;
    } else {
      setTransportationError(null);
    }

    if (transportation === 'LAINNYA' && transportationOther.trim().length === 0) {
      setTransportationOtherError('Sebutkan transportasi yang digunakan');
      hasError = true;
    } else {
      setTransportationOtherError(null);
    }

    const parsedCost = Number.parseInt(estimatedCost, 10);
    if (!estimatedCost.trim() || Number.isNaN(parsedCost) || parsedCost <= 0) {
      setEstimatedCostError('Estimasi biaya wajib diisi dan lebih dari 0');
      hasError = true;
    } else {
      setEstimatedCostError(null);
    }

    if (!attachment) {
      setAttachmentError('Lampiran rincian biaya wajib diunggah');
      hasError = true;
    } else {
      setAttachmentError(null);
    }

    if (hasError) return;

    const formData = new FormData();
    for (const id of selectedIds) formData.append('employeeIds', id);
    formData.append('startDate', range.start);
    formData.append('endDate', range.end);
    formData.append('activityDetail', activityDetail.trim());
    formData.append('destinationCity', destinationCity.trim());
    formData.append('destinationAddress', destinationAddress.trim());
    formData.append('purpose', purpose.trim());
    if (companyName.trim().length > 0) {
      formData.append('companyName', companyName.trim());
    }
    formData.append('transportation', transportation!);
    if (transportation === 'LAINNYA') {
      formData.append('transportationOther', transportationOther.trim());
    }
    formData.append('estimatedCost', String(parsedCost));
    formData.append('attachment', new File(attachment!.uri), attachment!.name);

    createMutation.mutate(formData, {
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
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Karyawan</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row flex-wrap items-center gap-2 rounded-xl bg-muted px-4 py-3">
            {selectedEmployees.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                Pilih karyawan...
              </Text>
            ) : (
              <Text className="flex-1 text-sm text-text">
                {selectedEmployees.map((employee) => employee.name).join(', ')}
              </Text>
            )}
          </Pressable>
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">
            Tanggal Berangkat - Estimasi Tanggal Pulang
          </Text>
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            className="flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
            <Icon name="calendar-outline" size={18} tone="muted" />
            <Text className="text-sm text-text">
              {formatShortDate(range.start)} - {formatShortDate(range.end)}
            </Text>
          </Pressable>
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Tujuan Kota</Text>
          <FormInput
            value={destinationCity}
            onChangeText={(next) => {
              setDestinationCity(next);
              if (destinationCityError) setDestinationCityError(null);
            }}
            placeholder="Contoh: Surabaya"
          />
          {destinationCityError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{destinationCityError}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">
            Lokasi/Alamat Tujuan
          </Text>
          <FormInput
            value={destinationAddress}
            onChangeText={(next) => {
              setDestinationAddress(next);
              if (destinationAddressError) setDestinationAddressError(null);
            }}
            placeholder="Contoh: Jl. Raya Darmo No. 1, Surabaya"
            multiline
            numberOfLines={2}
            style={{ minHeight: 56, textAlignVertical: 'top' }}
          />
          {destinationAddressError && (
            <Text className="text-xs text-red-600 dark:text-red-400">
              {destinationAddressError}
            </Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">
            Nama Perusahaan/Instansi yang Dikunjungi (opsional)
          </Text>
          <FormInput
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Contoh: PT Maju Bersama"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Keperluan Dinas</Text>
          <FormInput
            value={purpose}
            onChangeText={(next) => {
              setPurpose(next);
              if (purposeError) setPurposeError(null);
            }}
            placeholder="Contoh: presentasi proposal kerja sama"
          />
          {purposeError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{purposeError}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Transportasi</Text>
          <Pressable
            onPress={() => setTransportationPickerOpen(true)}
            className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
            <Text className="text-sm text-text">
              {transportation ? TRANSPORTATION_LABEL[transportation] : 'Pilih transportasi...'}
            </Text>
            <Icon name="chevron-down-outline" size={16} tone="primary" />
          </Pressable>
          {transportationError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{transportationError}</Text>
          )}
        </View>

        {transportation === 'LAINNYA' && (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-text">
              Sebutkan Transportasi
            </Text>
            <FormInput
              value={transportationOther}
              onChangeText={(next) => {
                setTransportationOther(next);
                if (transportationOtherError) setTransportationOtherError(null);
              }}
              placeholder="Contoh: sewa mobil"
            />
            {transportationOtherError && (
              <Text className="text-xs text-red-600 dark:text-red-400">
                {transportationOtherError}
              </Text>
            )}
          </View>
        )}

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Estimasi Biaya</Text>
          <FormInput
            value={estimatedCost}
            onChangeText={(next) => {
              setEstimatedCost(next.replace(/[^0-9]/g, ''));
              if (estimatedCostError) setEstimatedCostError(null);
            }}
            placeholder="Contoh: 1500000"
            keyboardType="numeric"
          />
          {estimatedCostError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{estimatedCostError}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Kegiatan/Tujuan</Text>
          <FormInput
            value={activityDetail}
            onChangeText={(next) => {
              setActivityDetail(next);
              if (reasonError) setReasonError(null);
            }}
            placeholder="Contoh: kunjungan klien di Surabaya"
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
            Upload Rincian Biaya (wajib)
          </Text>
          <Pressable
            onPress={handlePickAttachment}
            className="flex-row items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
            <Icon name="attach-outline" size={18} tone="muted" />
            <Text className="flex-1 text-sm text-muted-foreground" numberOfLines={1}>
              {attachment ? attachment.name : 'Pilih File'}
            </Text>
          </Pressable>
          <Text className="text-xs text-muted-foreground">
            JPG, PNG, WEBP, atau PDF, maks 5MB.
          </Text>
          {attachmentError && (
            <Text className="text-xs text-red-600 dark:text-red-400">{attachmentError}</Text>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60">
          {createMutation.isPending && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Kirim Penugasan</Text>
        </Pressable>
      </View>

      <EmployeeMultiSelect
        visible={isPickerOpen}
        employees={employees}
        selectedIds={selectedIds}
        onClose={() => setPickerOpen(false)}
        onApply={setSelectedIds}
      />

      <DateRangePicker
        visible={isDatePickerOpen}
        value={range}
        onClose={() => setDatePickerOpen(false)}
        onApply={(next) => {
          setRange(next);
          setDatePickerOpen(false);
        }}
      />

      <OptionDrawer
        visible={isTransportationPickerOpen}
        title="Pilih Transportasi"
        options={TRANSPORTATION_OPTIONS.map((value) => ({
          value,
          label: TRANSPORTATION_LABEL[value],
        }))}
        selected={transportation}
        onClose={() => setTransportationPickerOpen(false)}
        onSelect={(value) => {
          setTransportation(value);
          setTransportationError(null);
          setTransportationPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}
