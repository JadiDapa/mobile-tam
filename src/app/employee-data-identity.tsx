import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import { Icon } from '@/components/icon';
import { OptionDrawer } from '@/components/option-drawer';
import { SingleDatePicker } from '@/components/single-date-picker';
import { GENDER_LABEL, GENDER_OPTIONS, MARITAL_STATUS_LABEL, MARITAL_STATUS_OPTIONS, RELIGION_LABEL, RELIGION_OPTIONS } from '@/constants/status';
import { formatShortDate } from '@/lib/date';
import {
  useProfileDataQuery,
  useUpdatePersonalIdentityMutation,
  type Gender,
  type MaritalStatus,
  type Religion,
} from '@/lib/queries';

const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

type PickedFile = { uri: string; name: string; mimeType: string };

type FormState = {
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: Gender | null;
  religion: Religion | null;
  maritalStatus: MaritalStatus | null;
  nationality: string;
};

export default function EmployeeDataIdentityScreen() {
  const profile = useProfileDataQuery();
  const updateMutation = useUpdatePersonalIdentityMutation();

  const [form, setForm] = useState<FormState | null>(null);
  const [photo, setPhoto] = useState<PickedFile | null>(null);
  const [isGenderPickerOpen, setGenderPickerOpen] = useState(false);
  const [isReligionPickerOpen, setReligionPickerOpen] = useState(false);
  const [isMaritalPickerOpen, setMaritalPickerOpen] = useState(false);
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (form || !profile.data) return;

    const existing = profile.data.personalIdentity;
    setForm({
      nik: existing?.nik ?? '',
      placeOfBirth: existing?.placeOfBirth ?? '',
      dateOfBirth: existing?.dateOfBirth ? existing.dateOfBirth.slice(0, 10) : '',
      gender: existing?.gender ?? null,
      religion: existing?.religion ?? null,
      maritalStatus: existing?.maritalStatus ?? null,
      nationality: existing?.nationality ?? 'Indonesia',
    });
  }, [profile.data, form]);

  const existingPhotoUrl = profile.data?.personalIdentity?.ktpPhotoUrl ?? null;

  async function handlePickPhoto() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ATTACHMENT_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    setPhoto({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/octet-stream',
    });
  }

  function handleSubmit() {
    if (!form) return;

    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!/^\d{16}$/.test(form.nik)) {
      nextErrors.nik = 'NIK harus 16 digit angka';
    }
    if (form.placeOfBirth.trim().length === 0) {
      nextErrors.placeOfBirth = 'Tempat lahir wajib diisi';
    }
    if (!form.dateOfBirth) {
      nextErrors.dateOfBirth = 'Tanggal lahir wajib diisi';
    }
    if (!form.gender) {
      nextErrors.gender = 'Jenis kelamin wajib dipilih';
    }
    if (!form.religion) {
      nextErrors.religion = 'Agama wajib dipilih';
    }
    if (!form.maritalStatus) {
      nextErrors.maritalStatus = 'Status perkawinan wajib dipilih';
    }
    if (form.nationality.trim().length === 0) {
      nextErrors.nationality = 'Kewarganegaraan wajib diisi';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('nik', form.nik);
    formData.append('placeOfBirth', form.placeOfBirth.trim());
    formData.append('dateOfBirth', form.dateOfBirth);
    formData.append('gender', form.gender!);
    formData.append('religion', form.religion!);
    formData.append('maritalStatus', form.maritalStatus!);
    formData.append('nationality', form.nationality.trim());
    if (photo) {
      formData.append('ktpPhoto', new File(photo.uri), photo.name);
    }

    updateMutation.mutate(formData, {
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
    });
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
          <Text className="text-sm font-medium text-text">NIK</Text>
          <FormInput
            value={form.nik}
            onChangeText={(next) => setForm({ ...form, nik: next.replace(/[^0-9]/g, '').slice(0, 16) })}
            placeholder="16 digit NIK"
            keyboardType="numeric"
            maxLength={16}
          />
          {errors.nik && <Text className="text-xs text-red-600 dark:text-red-400">{errors.nik}</Text>}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Tempat Lahir</Text>
          <FormInput
            value={form.placeOfBirth}
            onChangeText={(next) => setForm({ ...form, placeOfBirth: next })}
            placeholder="Contoh: Jakarta"
          />
          {errors.placeOfBirth && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.placeOfBirth}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Tanggal Lahir</Text>
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            className="flex-row items-center gap-2 rounded-xl bg-muted px-4 py-3">
            <Icon name="calendar-outline" size={18} tone="muted" />
            <Text className="text-sm text-text">
              {form.dateOfBirth ? formatShortDate(form.dateOfBirth) : 'Pilih tanggal...'}
            </Text>
          </Pressable>
          {errors.dateOfBirth && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.dateOfBirth}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Jenis Kelamin</Text>
          <Pressable
            onPress={() => setGenderPickerOpen(true)}
            className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
            <Text className="text-sm text-text">
              {form.gender ? GENDER_LABEL[form.gender] : 'Pilih jenis kelamin...'}
            </Text>
            <Icon name="chevron-down-outline" size={16} tone="primary" />
          </Pressable>
          {errors.gender && <Text className="text-xs text-red-600 dark:text-red-400">{errors.gender}</Text>}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Agama</Text>
          <Pressable
            onPress={() => setReligionPickerOpen(true)}
            className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
            <Text className="text-sm text-text">
              {form.religion ? RELIGION_LABEL[form.religion] : 'Pilih agama...'}
            </Text>
            <Icon name="chevron-down-outline" size={16} tone="primary" />
          </Pressable>
          {errors.religion && <Text className="text-xs text-red-600 dark:text-red-400">{errors.religion}</Text>}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Status Perkawinan</Text>
          <Pressable
            onPress={() => setMaritalPickerOpen(true)}
            className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
            <Text className="text-sm text-text">
              {form.maritalStatus ? MARITAL_STATUS_LABEL[form.maritalStatus] : 'Pilih status perkawinan...'}
            </Text>
            <Icon name="chevron-down-outline" size={16} tone="primary" />
          </Pressable>
          {errors.maritalStatus && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.maritalStatus}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Kewarganegaraan</Text>
          <FormInput
            value={form.nationality}
            onChangeText={(next) => setForm({ ...form, nationality: next })}
            placeholder="Indonesia"
          />
          {errors.nationality && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.nationality}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Foto KTP (opsional)</Text>
          <Pressable
            onPress={handlePickPhoto}
            className="flex-row items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
            <Icon name="attach-outline" size={18} tone="muted" />
            <Text numberOfLines={1} className="flex-1 text-sm text-muted-foreground">
              {photo?.name ?? (existingPhotoUrl ? 'Sudah ada foto — pilih file untuk mengganti' : 'Pilih File')}
            </Text>
          </Pressable>
          <Text className="text-xs text-muted-foreground">
            JPG, PNG, WEBP, atau PDF, maks 5MB. Kosongkan jika tidak ingin mengganti foto.
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={updateMutation.isPending}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60">
          {updateMutation.isPending && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Simpan</Text>
        </Pressable>
      </View>

      <SingleDatePicker
        visible={isDatePickerOpen}
        value={form.dateOfBirth || null}
        maxDate={new Date().toISOString().slice(0, 10)}
        title="Pilih Tanggal Lahir"
        onClose={() => setDatePickerOpen(false)}
        onApply={(date) => {
          setForm({ ...form, dateOfBirth: date });
          setDatePickerOpen(false);
        }}
      />

      <OptionDrawer
        visible={isGenderPickerOpen}
        title="Pilih Jenis Kelamin"
        options={GENDER_OPTIONS.map((value) => ({ value, label: GENDER_LABEL[value] }))}
        selected={form.gender}
        onClose={() => setGenderPickerOpen(false)}
        onSelect={(value) => {
          setForm({ ...form, gender: value });
          setGenderPickerOpen(false);
        }}
      />

      <OptionDrawer
        visible={isReligionPickerOpen}
        title="Pilih Agama"
        options={RELIGION_OPTIONS.map((value) => ({ value, label: RELIGION_LABEL[value] }))}
        selected={form.religion}
        onClose={() => setReligionPickerOpen(false)}
        onSelect={(value) => {
          setForm({ ...form, religion: value });
          setReligionPickerOpen(false);
        }}
      />

      <OptionDrawer
        visible={isMaritalPickerOpen}
        title="Pilih Status Perkawinan"
        options={MARITAL_STATUS_OPTIONS.map((value) => ({ value, label: MARITAL_STATUS_LABEL[value] }))}
        selected={form.maritalStatus}
        onClose={() => setMaritalPickerOpen(false)}
        onSelect={(value) => {
          setForm({ ...form, maritalStatus: value });
          setMaritalPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}
