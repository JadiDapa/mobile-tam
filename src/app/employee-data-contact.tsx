import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import { useProfileDataQuery, useUpdateContactMutation, type Contact } from '@/lib/queries';

export default function EmployeeDataContactScreen() {
  const profile = useProfileDataQuery();
  const updateMutation = useUpdateContactMutation();

  const [form, setForm] = useState<Contact | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({});

  useEffect(() => {
    if (form || !profile.data) return;

    const existing = profile.data.contact;
    setForm({
      domicileAddress: existing?.domicileAddress ?? '',
      ktpAddress: existing?.ktpAddress ?? '',
      emergencyContactName: existing?.emergencyContactName ?? '',
      emergencyContactRelation: existing?.emergencyContactRelation ?? '',
      emergencyContactPhone: existing?.emergencyContactPhone ?? '',
    });
  }, [profile.data, form]);

  function handleSubmit() {
    if (!form) return;

    const nextErrors: Partial<Record<keyof Contact, string>> = {};
    if (form.domicileAddress.trim().length === 0) nextErrors.domicileAddress = 'Alamat domisili wajib diisi';
    if (form.ktpAddress.trim().length === 0) nextErrors.ktpAddress = 'Alamat KTP wajib diisi';
    if (form.emergencyContactName.trim().length === 0)
      nextErrors.emergencyContactName = 'Nama kontak darurat wajib diisi';
    if (form.emergencyContactRelation.trim().length === 0)
      nextErrors.emergencyContactRelation = 'Hubungan keluarga wajib diisi';
    if (form.emergencyContactPhone.trim().length === 0)
      nextErrors.emergencyContactPhone = 'Nomor telepon kontak darurat wajib diisi';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateMutation.mutate(
      {
        domicileAddress: form.domicileAddress.trim(),
        ktpAddress: form.ktpAddress.trim(),
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactRelation: form.emergencyContactRelation.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
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
          <Text className="text-sm font-medium text-text">Alamat Domisili</Text>
          <FormInput
            value={form.domicileAddress}
            onChangeText={(next) => setForm({ ...form, domicileAddress: next })}
            placeholder="Alamat tempat tinggal saat ini"
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />
          {errors.domicileAddress && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.domicileAddress}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Alamat KTP</Text>
          <FormInput
            value={form.ktpAddress}
            onChangeText={(next) => setForm({ ...form, ktpAddress: next })}
            placeholder="Alamat sesuai KTP"
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />
          {errors.ktpAddress && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.ktpAddress}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Nama Kontak Darurat</Text>
          <FormInput
            value={form.emergencyContactName}
            onChangeText={(next) => setForm({ ...form, emergencyContactName: next })}
            placeholder="Contoh: Siti Aminah"
          />
          {errors.emergencyContactName && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.emergencyContactName}</Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Hubungan Keluarga</Text>
          <FormInput
            value={form.emergencyContactRelation}
            onChangeText={(next) => setForm({ ...form, emergencyContactRelation: next })}
            placeholder="Contoh: Orang Tua, Suami/Istri"
          />
          {errors.emergencyContactRelation && (
            <Text className="text-xs text-red-600 dark:text-red-400">
              {errors.emergencyContactRelation}
            </Text>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">
            Nomor Telepon Kontak Darurat
          </Text>
          <FormInput
            value={form.emergencyContactPhone}
            onChangeText={(next) => setForm({ ...form, emergencyContactPhone: next.replace(/[^0-9+]/g, '') })}
            placeholder="Contoh: 081234567890"
            keyboardType="phone-pad"
          />
          {errors.emergencyContactPhone && (
            <Text className="text-xs text-red-600 dark:text-red-400">{errors.emergencyContactPhone}</Text>
          )}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={updateMutation.isPending}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60">
          {updateMutation.isPending && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Simpan</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
