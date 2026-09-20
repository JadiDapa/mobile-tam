import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import { formatLongIndonesianDate, formatTime } from '@/lib/date';
import {
  type AdminDailyRecapItem,
  type AdminRecapAttendanceEntry,
  type AdminRecapOvertimeEntry,
  useAdminAddAttendanceMutation,
  useAdminUpdateAttendanceTimeMutation,
  useAdminUpdateOvertimeTimeMutation,
} from '@/lib/queries';

type AttendanceType = 'CHECK_IN' | 'CHECK_OUT';

const TYPE_LABEL: Record<AttendanceType, string> = {
  CHECK_IN: 'Absen Masuk',
  CHECK_OUT: 'Absen Pulang',
};

/** Jam awal saat admin menambahkan absen yang hilang — tinggal digeser. */
const DEFAULT_ADD_TIME: Record<AttendanceType, [number, number]> = {
  CHECK_IN: [8, 0],
  CHECK_OUT: [17, 0],
};

/** Yang sedang diisi di form: menambah absen, mengoreksi absen, atau mengoreksi lembur. */
type FormState =
  | { kind: 'add'; type: AttendanceType; time: Date }
  | { kind: 'edit'; type: AttendanceType; id: string; time: Date }
  | { kind: 'overtime'; id: string; start: Date; end: Date | null; picking: 'start' | 'end' };

function toHHmm(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function atTime(day: string, hours: number, minutes: number) {
  const date = new Date(`${day}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function AdminBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-primary/10 px-2 py-0.5">
      <Text className="text-[10px] font-medium text-primary">{label}</Text>
    </View>
  );
}

function EntryRow({
  title,
  entry,
  onEdit,
  onAdd,
}: {
  title: string;
  entry: AdminRecapAttendanceEntry | null;
  onEdit: () => void;
  onAdd: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
      <View className="flex-1 gap-1">
        <Text className="text-xs text-muted-foreground">{title}</Text>
        <Text className="text-lg font-bold text-text">{entry ? formatTime(entry.timestamp) : '--:--'}</Text>
        {entry && (entry.addedByAdmin || entry.editedByAdmin) && (
          <View className="flex-row flex-wrap items-center gap-1">
            {entry.addedByAdmin && <AdminBadge label="Ditambahkan admin" />}
            {entry.editedByAdmin && (
              <AdminBadge
                label={
                  entry.originalTimestamp
                    ? `Diubah admin (asli ${formatTime(entry.originalTimestamp)})`
                    : 'Diubah admin'
                }
              />
            )}
          </View>
        )}
      </View>

      <Pressable
        onPress={entry ? onEdit : onAdd}
        className="flex-row items-center gap-1 rounded-xl bg-primary px-3 py-2">
        <Icon name={entry ? 'create-outline' : 'add-outline'} size={16} tone="inverse" />
        <Text className="text-sm font-medium text-primary-foreground">{entry ? 'Ubah' : 'Tambah'}</Text>
      </Pressable>
    </View>
  );
}

function OvertimeRow({ overtime, onEdit }: { overtime: AdminRecapOvertimeEntry; onEdit: () => void }) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
      <View className="flex-1 gap-1">
        <Text className="text-xs text-muted-foreground">Lembur</Text>
        <Text className="text-lg font-bold text-text">
          {formatTime(overtime.startAt)} — {overtime.endAt ? formatTime(overtime.endAt) : 'Berjalan'}
        </Text>
        {overtime.editedByAdmin && <AdminBadge label="Diubah admin" />}
      </View>

      <Pressable onPress={onEdit} className="flex-row items-center gap-1 rounded-xl bg-primary px-3 py-2">
        <Icon name="create-outline" size={16} tone="inverse" />
        <Text className="text-sm font-medium text-primary-foreground">Ubah</Text>
      </Pressable>
    </View>
  );
}

/**
 * Bottom-sheet admin untuk satu karyawan pada satu hari: tambah absen masuk/pulang
 * yang terlewat (berlabel "Ditambahkan admin") dan koreksi jam absen/lembur (berlabel
 * "Diubah admin"). Alasan wajib diisi di kedua kasus — server menolak tanpa alasan.
 */
export function AdminAttendanceSheet({
  item,
  date,
  onClose,
}: {
  /** Null = sheet tertutup. */
  item: AdminDailyRecapItem | null;
  /** "YYYY-MM-DD" */
  date: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addAttendance = useAdminAddAttendanceMutation();
  const updateAttendance = useAdminUpdateAttendanceTimeMutation();
  const updateOvertime = useAdminUpdateOvertimeTimeMutation();

  const submitting = addAttendance.isPending || updateAttendance.isPending || updateOvertime.isPending;

  function reset() {
    setForm(null);
    setNote('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function openForm(next: FormState) {
    setNote('');
    setError(null);
    setForm(next);
  }

  function openAdd(type: AttendanceType) {
    const [hours, minutes] = DEFAULT_ADD_TIME[type];
    openForm({ kind: 'add', type, time: atTime(date, hours, minutes) });
  }

  function openEdit(type: AttendanceType, entry: AdminRecapAttendanceEntry) {
    openForm({ kind: 'edit', type, id: entry.id, time: new Date(entry.timestamp) });
  }

  function openOvertime(overtime: AdminRecapOvertimeEntry) {
    openForm({
      kind: 'overtime',
      id: overtime.id,
      start: new Date(overtime.startAt),
      end: overtime.endAt ? new Date(overtime.endAt) : null,
      picking: 'start',
    });
  }

  function handleResult(result: { ok: true; message: string } | { ok: false; error: string }) {
    if (!result.ok) {
      setError(result.error);
      return;
    }

    Alert.alert('Berhasil', result.message);
    reset();
  }

  function handleError(caught: unknown) {
    setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan, coba lagi');
  }

  function handleSubmit() {
    if (!form || !item) return;

    const reason = note.trim();

    if (!reason) {
      setError('Tulis alasannya dulu.');
      return;
    }

    setError(null);

    if (form.kind === 'add') {
      addAttendance.mutate(
        {
          userId: item.userId,
          workDate: date,
          type: form.type,
          time: toHHmm(form.time),
          workMode: 'HADIR_DIKANTOR',
          reviewNote: reason,
        },
        { onSuccess: handleResult, onError: handleError },
      );
    } else if (form.kind === 'edit') {
      updateAttendance.mutate(
        { id: form.id, time: toHHmm(form.time), editNote: reason },
        { onSuccess: handleResult, onError: handleError },
      );
    } else {
      updateOvertime.mutate(
        {
          id: form.id,
          startTime: toHHmm(form.start),
          endTime: form.end ? toHHmm(form.end) : undefined,
          editNote: reason,
        },
        { onSuccess: handleResult, onError: handleError },
      );
    }
  }

  const formTitle =
    form?.kind === 'add'
      ? `Tambah ${TYPE_LABEL[form.type]}`
      : form?.kind === 'edit'
        ? `Ubah ${TYPE_LABEL[form.type]}`
        : 'Ubah Jam Lembur';

  return (
    <Modal visible={item !== null} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
          <Pressable
            className="max-h-[90%] rounded-t-2xl bg-card p-4 pb-6"
            onPress={(event) => event.stopPropagation()}>
            {item && (
              <ScrollView contentContainerClassName="gap-3" keyboardShouldPersistTaps="handled">
                <Text className="text-center text-base font-bold text-text">{item.name}</Text>
                <Text className="-mt-2 text-center text-sm text-muted-foreground">
                  {formatLongIndonesianDate(new Date(`${date}T00:00:00`))}
                </Text>

                {form === null ? (
                  <>
                    <EntryRow
                      title="Absen Masuk"
                      entry={item.checkIn}
                      onEdit={() => item.checkIn && openEdit('CHECK_IN', item.checkIn)}
                      onAdd={() => openAdd('CHECK_IN')}
                    />
                    <EntryRow
                      title="Absen Pulang"
                      entry={item.checkOut}
                      onEdit={() => item.checkOut && openEdit('CHECK_OUT', item.checkOut)}
                      onAdd={() => openAdd('CHECK_OUT')}
                    />

                    {item.overtimes.map((overtime) => (
                      <OvertimeRow key={overtime.id} overtime={overtime} onEdit={() => openOvertime(overtime)} />
                    ))}

                    <Pressable onPress={handleClose} className="items-center rounded-xl py-3">
                      <Text className="text-sm text-muted-foreground">Tutup</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text className="pt-1 text-center text-sm font-medium text-text">{formTitle}</Text>

                    {form.kind === 'overtime' ? (
                      <View className="gap-2">
                        <View className="flex-row gap-1 rounded-2xl bg-muted p-1">
                          {(['start', 'end'] as const).map((which) => (
                            <Pressable
                              key={which}
                              onPress={() => {
                                // Lembur yang masih berjalan tidak punya jam selesai — mulai dari "sekarang".
                                if (which === 'end' && form.end === null) {
                                  setForm({ ...form, end: new Date(), picking: 'end' });
                                } else {
                                  setForm({ ...form, picking: which });
                                }
                              }}
                              className={
                                form.picking === which
                                  ? 'flex-1 items-center rounded-xl bg-primary py-2'
                                  : 'flex-1 items-center rounded-xl py-2'
                              }>
                              <Text
                                className={
                                  form.picking === which
                                    ? 'text-sm font-medium text-primary-foreground'
                                    : 'text-sm text-muted-foreground'
                                }>
                                {which === 'start'
                                  ? `Mulai ${toHHmm(form.start)}`
                                  : `Selesai ${form.end ? toHHmm(form.end) : '—'}`}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        <DateTimePicker
                          key={form.picking}
                          value={form.picking === 'start' ? form.start : (form.end ?? new Date())}
                          mode="time"
                          presentation="inline"
                          onValueChange={(_event, picked) =>
                            setForm(form.picking === 'start' ? { ...form, start: picked } : { ...form, end: picked })
                          }
                        />
                      </View>
                    ) : (
                      <DateTimePicker
                        value={form.time}
                        mode="time"
                        presentation="inline"
                        onValueChange={(_event, picked) => setForm({ ...form, time: picked })}
                      />
                    )}

                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder={
                        form.kind === 'add'
                          ? 'Alasan penambahan (wajib)'
                          : 'Alasan perubahan jam (wajib)'
                      }
                      multiline
                      numberOfLines={3}
                      maxLength={300}
                      className="min-h-20 rounded-xl bg-muted p-3 text-sm text-text"
                      textAlignVertical="top"
                    />

                    {error && <Text className="text-center text-xs text-red-600 dark:text-red-400">{error}</Text>}

                    <Pressable
                      disabled={submitting}
                      onPress={handleSubmit}
                      className={`items-center rounded-xl bg-primary py-3.5 ${submitting ? 'opacity-60' : ''}`}>
                      <Text className="font-medium text-primary-foreground">
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                      </Text>
                    </Pressable>

                    <Pressable disabled={submitting} onPress={reset} className="items-center rounded-xl py-3">
                      <Text className="text-sm text-muted-foreground">Batal</Text>
                    </Pressable>
                  </>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
