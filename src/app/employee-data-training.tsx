import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import { useProfileDataQuery, useUpdateTrainingMutation } from '@/lib/queries';

export default function EmployeeDataTrainingScreen() {
  const profile = useProfileDataQuery();
  const updateMutation = useUpdateTrainingMutation();

  const [trainingHistory, setTrainingHistory] = useState<string | null>(null);

  useEffect(() => {
    if (trainingHistory !== null || !profile.data) return;
    setTrainingHistory(profile.data.training?.trainingHistory ?? '');
  }, [profile.data, trainingHistory]);

  function handleSubmit() {
    if (trainingHistory === null) return;

    updateMutation.mutate(
      { trainingHistory: trainingHistory.trim() || null },
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

  if (profile.isPending || trainingHistory === null) {
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
          <Text className="text-sm font-medium text-text">
            Riwayat Training/Seminar/Sertifikasi
          </Text>
          <FormInput
            value={trainingHistory}
            onChangeText={setTrainingHistory}
            placeholder="Contoh: Pelatihan K3 tahun 2024, Sertifikasi Akuntansi Dasar 2023"
            multiline
            numberOfLines={8}
            style={{ minHeight: 160, textAlignVertical: 'top' }}
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
