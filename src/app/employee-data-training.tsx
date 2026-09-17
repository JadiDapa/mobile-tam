import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import {
  useCreateTrainingMutation,
  useDeleteTrainingMutation,
  useProfileDataQuery,
  useUpdateTrainingMutation,
  type Training,
  type TrainingInput,
} from '@/lib/queries';

type FormState = TrainingInput;

const EMPTY: FormState = { name: '', organizer: '', period: '' };

function EntryForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  submitting: boolean;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  return (
    <View className="gap-3 rounded-2xl bg-muted p-4">
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text">Nama Pelatihan</Text>
        <FormInput
          value={form.name}
          onChangeText={(next) => setForm({ ...form, name: next })}
          placeholder="Contoh: Pelatihan K3"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text">Penyelenggara</Text>
        <FormInput
          value={form.organizer ?? ''}
          onChangeText={(next) => setForm({ ...form, organizer: next })}
          placeholder="Contoh: Kemnaker RI"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text">Tahun/Periode</Text>
        <FormInput
          value={form.period ?? ''}
          onChangeText={(next) => setForm({ ...form, period: next })}
          placeholder="Contoh: 2024"
        />
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() =>
            onSubmit({
              name: form.name.trim(),
              organizer: form.organizer?.trim() || null,
              period: form.period?.trim() || null,
            })
          }
          disabled={submitting}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3 disabled:opacity-60">
          {submitting && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Simpan</Text>
        </Pressable>
        <Pressable onPress={onCancel} className="rounded-xl bg-background px-4 py-3">
          <Text className="font-medium text-text">Batal</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
  deleting,
}: {
  entry: Training;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <View className="gap-3 rounded-2xl bg-muted p-4">
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Nama Pelatihan</Text>
        <Text className="text-sm font-medium text-text">{entry.name}</Text>
      </View>
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Penyelenggara</Text>
        <Text className="text-sm font-medium text-text">{entry.organizer || '—'}</Text>
      </View>
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Tahun/Periode</Text>
        <Text className="text-sm font-medium text-text">{entry.period || '—'}</Text>
      </View>
      <View className="flex-row gap-2 pt-1">
        <Pressable onPress={onEdit} className="flex-1 rounded-xl bg-background py-2.5">
          <Text className="text-center text-sm font-medium text-text">Edit</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          disabled={deleting}
          className="flex-1 rounded-xl bg-background py-2.5 disabled:opacity-60">
          {deleting ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-center text-sm font-medium text-destructive">Hapus</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default function EmployeeDataTrainingScreen() {
  const profile = useProfileDataQuery();
  const createMutation = useCreateTrainingMutation();
  const updateMutation = useUpdateTrainingMutation();
  const deleteMutation = useDeleteTrainingMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (profile.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const entries = profile.data?.training ?? [];

  function handleCreate(form: FormState) {
    createMutation.mutate(form, {
      onSuccess: (result) => {
        if (!result.ok) {
          Alert.alert('Gagal Menyimpan', result.error);
          return;
        }
        setAdding(false);
      },
      onError: (error) => {
        Alert.alert('Gagal Menyimpan', error instanceof Error ? error.message : 'Coba lagi.');
      },
    });
  }

  function handleUpdate(id: string, form: FormState) {
    updateMutation.mutate(
      { id, input: form },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            Alert.alert('Gagal Menyimpan', result.error);
            return;
          }
          setEditingId(null);
        },
        onError: (error) => {
          Alert.alert('Gagal Menyimpan', error instanceof Error ? error.message : 'Coba lagi.');
        },
      },
    );
  }

  function handleDelete(id: string) {
    Alert.alert('Hapus Pelatihan', 'Hapus pelatihan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(id, {
            onError: (error) => {
              Alert.alert('Gagal Menghapus', error instanceof Error ? error.message : 'Coba lagi.');
            },
          });
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-5">
        <Text className="text-xs text-muted-foreground">
          Opsional — tambahkan pelatihan/seminar/sertifikasi sebanyak yang perlu.
        </Text>

        {entries.length === 0 && !adding && (
          <Text className="text-sm text-muted-foreground">Belum ada pelatihan.</Text>
        )}

        {entries.map((entry) =>
          editingId === entry.id ? (
            <EntryForm
              key={entry.id}
              initial={{ name: entry.name, organizer: entry.organizer, period: entry.period }}
              submitting={updateMutation.isPending}
              onSubmit={(form) => handleUpdate(entry.id, form)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => setEditingId(entry.id)}
              onDelete={() => handleDelete(entry.id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === entry.id}
            />
          ),
        )}

        {adding ? (
          <EntryForm
            initial={EMPTY}
            submitting={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <Pressable
            onPress={() => setAdding(true)}
            className="mt-2 items-center justify-center rounded-xl bg-muted py-3.5">
            <Text className="font-medium text-text">+ Tambah Pelatihan</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
