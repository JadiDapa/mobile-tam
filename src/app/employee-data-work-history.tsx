import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import { useProfileDataQuery, useUpdateWorkHistoryMutation } from '@/lib/queries';

type FormState = {
  previousCompany: string;
  previousPosition: string;
  previousDuration: string;
};

export default function EmployeeDataWorkHistoryScreen() {
  const profile = useProfileDataQuery();
  const updateMutation = useUpdateWorkHistoryMutation();

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (form || !profile.data) return;

    const existing = profile.data.workHistory;
    setForm({
      previousCompany: existing?.previousCompany ?? '',
      previousPosition: existing?.previousPosition ?? '',
      previousDuration: existing?.previousDuration ?? '',
    });
  }, [profile.data, form]);

  function handleSubmit() {
    if (!form) return;

    updateMutation.mutate(
      {
        previousCompany: form.previousCompany.trim() || null,
        previousPosition: form.previousPosition.trim() || null,
        previousDuration: form.previousDuration.trim() || null,
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
        <Text className="text-xs text-muted-foreground">
          Semua kolom di bawah ini opsional.
        </Text>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Perusahaan Sebelumnya</Text>
          <FormInput
            value={form.previousCompany}
            onChangeText={(next) => setForm({ ...form, previousCompany: next })}
            placeholder="Contoh: PT Maju Bersama"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Posisi Sebelumnya</Text>
          <FormInput
            value={form.previousPosition}
            onChangeText={(next) => setForm({ ...form, previousPosition: next })}
            placeholder="Contoh: Staff Administrasi"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Lama Bekerja</Text>
          <FormInput
            value={form.previousDuration}
            onChangeText={(next) => setForm({ ...form, previousDuration: next })}
            placeholder="Contoh: 2 tahun 3 bulan"
          />
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
