import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import { Icon } from '@/components/icon';
import { OptionDrawer } from '@/components/option-drawer';
import { SingleDatePicker } from '@/components/single-date-picker';
import { EMPLOYMENT_STATUS_LABEL, EMPLOYMENT_STATUS_OPTIONS } from '@/constants/status';
import { formatShortDate } from '@/lib/date';
import { useProfileDataQuery, useUpdateEmploymentDataMutation, type EmploymentStatus } from '@/lib/queries';

type FormState = {
  employeeNumber: string;
  workLocation: string;
  employmentStatus: EmploymentStatus | null;
  startDate: string;
  contractEndDate: string;
};

export default function EmployeeDataEmploymentScreen() {
  const profile = useProfileDataQuery();
  const updateMutation = useUpdateEmploymentDataMutation();

  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isStatusPickerOpen, setStatusPickerOpen] = useState(false);
  const [isStartDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = useState(false);

  useEffect(() => {
    if (form || !profile.data) return;

    const existing = profile.data.employmentData;
    setForm({
      employeeNumber: existing?.employeeNumber ?? '',
      workLocation: existing?.workLocation ?? '',
      employmentStatus: existing?.employmentStatus ?? null,
      startDate: existing?.startDate ? existing.startDate.slice(0, 10) : '',
      contractEndDate: existing?.contractEndDate ? existing.contractEndDate.slice(0, 10) : '',
    });
  }, [profile.data, form]);

  function handleSubmit() {
    if (!form) return;

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (form.employeeNumber.trim().length === 0) nextErrors.employeeNumber = 'Nomor induk pegawai wajib diisi';
    if (form.workLocation.trim().length === 0) nextErrors.workLocation = 'Lokasi kerja wajib diisi';
    if (!form.employmentStatus) nextErrors.employmentStatus = 'Status karyawan wajib dipilih';
    if (!form.startDate) nextErrors.startDate = 'Tanggal masuk wajib diisi';
    if (form.employmentStatus === 'PKWT' && !form.contractEndDate) {
      nextErrors.contractEndDate = 'Tanggal berakhir kontrak wajib diisi untuk PKWT';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateMutation.mutate(
      {
        employeeNumber: form.employeeNumber.trim(),
        workLocation: form.workLocation.trim(),
        employmentStatus: form.employmentStatus!,
        startDate: form.startDate,
        contractEndDate: form.employmentStatus === 'PKWT' ? form.contractEndDate : null,
      },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            Alert.alert('Gagal Menyimpan', result.error);
            return;
          }
          Alert.alert('Tersimpan', result.message, [{ text: 'OK', onPress: () => router.back() }]);
        },
        onError: (error) => {
          Alert.alert('Gagal Menyimpan', error instanceof Error ? error.message : 'Coba lagi.');
        },
      },
    );
  }

  if (profile.isPending || !form) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-5">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Nomor Induk Pegawai</Text>
          <FormInput
            value={form.employeeNumber}
            onChangeText={(next) => setForm({ ...form, employeeNumber: next })}
            placeholder="Contoh: EMP-0012"
          />
          {errors.employeeNumber && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.employeeNumber}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Lokasi Kerja</Text>
          <FormInput
            value={form.workLocation}
            onChangeText={(next) => setForm({ ...form, workLocation: next })}
            placeholder="Contoh: Kantor Pusat Jakarta"
          />
          {errors.workLocation && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.workLocation}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Status Karyawan</Text>
          <Pressable
            onPress={() => setStatusPickerOpen(true)}
            className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
            <Text className="text-sm text-text">
              {form.employmentStatus ? EMPLOYMENT_STATUS_LABEL[form.employmentStatus] : 'Pilih status...'}
            </Text>
            <Icon name="chevron-down-outline" size={16} tone="primary" />
          </Pressable>
          {errors.employmentStatus && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.employmentStatus}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Tanggal Masuk</Text>
          <Pressable
            onPress={() => setStartDatePickerOpen(true)}
            className="flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
            <Icon name="calendar-outline" size={18} tone="muted" />
            <Text className="text-sm text-text">
              {form.startDate ? formatShortDate(form.startDate) : 'Pilih tanggal...'}
            </Text>
          </Pressable>
          {errors.startDate && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.startDate}</Text>
          )}
        </View>

        {form.employmentStatus === 'PKWT' && (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-text">
              Tanggal Berakhir Kontrak
            </Text>
            <Pressable
              onPress={() => setEndDatePickerOpen(true)}
              className="flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
              <Icon name="calendar-outline" size={18} tone="muted" />
              <Text className="text-sm text-text">
                {form.contractEndDate ? formatShortDate(form.contractEndDate) : 'Pilih tanggal...'}
              </Text>
            </Pressable>
            {errors.contractEndDate && (
              <Text className="text-xs text-red-600 dark:text-red-400">{errors.contractEndDate}</Text>
            )}
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={updateMutation.isPending}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60">
          {updateMutation.isPending && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Simpan</Text>
        </Pressable>
      </View>

      <SingleDatePicker
        visible={isStartDatePickerOpen}
        value={form.startDate || null}
        title="Pilih Tanggal Masuk"
        onClose={() => setStartDatePickerOpen(false)}
        onApply={(date) => {
          setForm({ ...form, startDate: date });
          setStartDatePickerOpen(false);
        }}
      />

      <SingleDatePicker
        visible={isEndDatePickerOpen}
        value={form.contractEndDate || null}
        minDate={form.startDate || undefined}
        title="Pilih Tanggal Berakhir Kontrak"
        onClose={() => setEndDatePickerOpen(false)}
        onApply={(date) => {
          setForm({ ...form, contractEndDate: date });
          setEndDatePickerOpen(false);
        }}
      />

      <OptionDrawer
        visible={isStatusPickerOpen}
        title="Pilih Status Karyawan"
        options={EMPLOYMENT_STATUS_OPTIONS.map((value) => ({ value, label: EMPLOYMENT_STATUS_LABEL[value] }))}
        selected={form.employmentStatus}
        onClose={() => setStatusPickerOpen(false)}
        onSelect={(value) => {
          setForm({ ...form, employmentStatus: value });
          setStatusPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}
