import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import type { Employee } from '@/lib/queries';

type EmployeeMultiSelectProps = {
  visible: boolean;
  employees: Employee[];
  selectedIds: string[];
  onClose: () => void;
  onApply: (ids: string[]) => void;
};

/** Modal checklist karyawan — combobox multi-select base-ui tidak ada padanannya
 * di React Native, jadi ini list custom (cari + centang) bukan port langsung. */
export function EmployeeMultiSelect({
  visible,
  employees,
  selectedIds,
  onClose,
  onApply,
}: EmployeeMultiSelectProps) {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<string[]>(selectedIds);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((employee) => employee.name.toLowerCase().includes(q));
  }, [employees, query]);

  function toggle(id: string) {
    setDraft((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function handleClose() {
    setDraft(selectedIds);
    setQuery('');
    onClose();
  }

  function handleApply() {
    onApply(draft);
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
        <Pressable
          className="max-h-[80%] gap-3 rounded-t-2xl bg-card p-4"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">
            Pilih Karyawan
          </Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari nama karyawan..."
            placeholderTextColor="#9ca3af"
            className="rounded-xl bg-muted px-4 py-3 text-text"
          />

          {draft.length > 0 && (
            <Text className="text-xs text-muted-foreground">
              {draft.length} karyawan dipilih
            </Text>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(employee) => employee.id}
            style={{ maxHeight: 320 }}
            ListEmptyComponent={
              <Text className="py-6 text-center text-sm text-muted-foreground">
                Karyawan tidak ditemukan.
              </Text>
            }
            renderItem={({ item: employee }) => {
              const isSelected = draft.includes(employee.id);

              return (
                <Pressable
                  onPress={() => toggle(employee.id)}
                  className="flex-row items-center gap-3 border-b border-border py-3">
                  <View
                    className={
                      isSelected
                        ? 'h-5 w-5 items-center justify-center rounded-md bg-primary'
                        : 'h-5 w-5 rounded-md border border-border'
                    }>
                    {isSelected && <Icon name="checkmark" size={14} tone="inverse" />}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-text">{employee.name}</Text>
                    {employee.position && (
                      <Text className="text-xs text-muted-foreground">
                        {employee.position}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            }}
          />

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center rounded-xl bg-muted py-3">
              <Text className="text-text">Batal</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              className="flex-1 items-center rounded-xl bg-primary py-3">
              <Text className="font-medium text-primary-foreground">Pilih ({draft.length})</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
