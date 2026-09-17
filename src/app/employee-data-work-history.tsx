import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { FormInput } from '@/components/form-input';
import {
  useCreateWorkHistoryMutation,
  useDeleteWorkHistoryMutation,
  useProfileDataQuery,
  useUpdateWorkHistoryMutation,
  type WorkHistory,
  type WorkHistoryInput,
} from '@/lib/queries';

type FormState = WorkHistoryInput;

const EMPTY: FormState = {
  previousCompany: '',
  previousPosition: '',
  previousDuration: '',
};

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
        <Text className="text-sm font-medium text-text">Perusahaan Sebelumnya</Text>
        <FormInput
          value={form.previousCompany ?? ''}
          onChangeText={(next) => setForm({ ...form, previousCompany: next })}
          placeholder="Contoh: PT Maju Bersama"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text">Posisi Sebelumnya</Text>
        <FormInput
          value={form.previousPosition ?? ''}
          onChangeText={(next) => setForm({ ...form, previousPosition: next })}
          placeholder="Contoh: Staff Administrasi"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-text">Lama Bekerja</Text>
        <FormInput
          value={form.previousDuration ?? ''}
          onChangeText={(next) => setForm({ ...form, previousDuration: next })}
          placeholder="Contoh: 2 tahun 3 bulan"
        />
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() =>
            onSubmit({
              previousCompany: form.previousCompany?.trim() || null,
              previousPosition: form.previousPosition?.trim() || null,
              previousDuration: form.previousDuration?.trim() || null,
            })
          }
          disabled={submitting}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3 disabled:opacity-60">
          {submitting && <ActivityIndicator color="white" />}
          <Text className="font-medium text-primary-foreground">Simpan</Text>
        </Pressable>
        <Pressable
          onPress={onCancel}
          className="rounded-xl bg-background px-4 py-3">
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
  entry: WorkHistory;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <View className="gap-3 rounded-2xl bg-muted p-4">
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Perusahaan</Text>
        <Text className="text-sm font-medium text-text">{entry.previousCompany || '—'}</Text>
      </View>
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Posisi</Text>
        <Text className="text-sm font-medium text-text">{entry.previousPosition || '—'}</Text>
      </View>
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">Lama Bekerja</Text>
        <Text className="text-sm font-medium text-text">{entry.previousDuration || '—'}</Text>
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

export default function EmployeeDataWorkHistoryScreen() {
  const profile = useProfileDataQuery();
  const createMutation = useCreateWorkHistoryMutation();
  const updateMutation = useUpdateWorkHistoryMutation();
  const deleteMutation = useDeleteWorkHistoryMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (profile.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const entries = profile.data?.workHistory ?? [];

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
    Alert.alert('Hapus Riwayat Pekerjaan', 'Hapus riwayat pekerjaan ini?', [
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
          Opsional — tambahkan riwayat pekerjaan sebelumnya sebanyak yang perlu.
        </Text>

        {entries.length === 0 && !adding && (
          <Text className="text-sm text-muted-foreground">Belum ada riwayat pekerjaan.</Text>
        )}

        {entries.map((entry) =>
          editingId === entry.id ? (
            <EntryForm
              key={entry.id}
              initial={{
                previousCompany: entry.previousCompany,
                previousPosition: entry.previousPosition,
                previousDuration: entry.previousDuration,
              }}
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
            <Text className="font-medium text-text">+ Tambah Riwayat Pekerjaan</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
