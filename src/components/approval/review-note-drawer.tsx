import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { Text, TextInput } from '@/components/ui/text';

/** Bottom-sheet untuk mengisi catatan opsional sebelum menyetujui/menolak pengajuan. */
export function ReviewNoteDrawer({
  visible,
  title,
  confirmLabel,
  destructive = false,
  submitting = false,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  confirmLabel: string;
  destructive?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  const [wasVisible, setWasVisible] = useState(visible);

  // Reset the note when the drawer transitions from hidden to visible — adjusting
  // state during render (not an effect) avoids an extra commit before the reset shows.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setNote('');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="gap-3 rounded-t-2xl bg-card p-4 pb-6"
          onPress={(event) => event.stopPropagation()}>
          <Text className="text-center text-base font-bold text-text">{title}</Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Catatan (opsional)"
            multiline
            numberOfLines={3}
            className="min-h-20 rounded-xl bg-muted p-3 text-sm text-text"
            textAlignVertical="top"
          />

          <Pressable
            disabled={submitting}
            onPress={() => onConfirm(note.trim())}
            className={`items-center rounded-xl py-3.5 ${
              destructive ? 'bg-destructive' : 'bg-primary'
            } ${submitting ? 'opacity-60' : ''}`}>
            <Text className="font-medium text-primary-foreground">
              {submitting ? 'Memproses...' : confirmLabel}
            </Text>
          </Pressable>

          <Pressable disabled={submitting} onPress={onClose} className="items-center rounded-xl py-3">
            <Text className="text-sm text-muted-foreground">Batal</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
