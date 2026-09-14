import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';

import { ReviewNoteDrawer } from './review-note-drawer';

/** Baris tombol Setujui/Tolak untuk kartu pengajuan yang masih menunggu keputusan. */
export function ApprovalActions({
  onApprove,
  onReject,
  submitting = false,
}: {
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
  submitting?: boolean;
}) {
  const [drawer, setDrawer] = useState<'approve' | 'reject' | null>(null);

  function handleConfirm(note: string) {
    if (drawer === 'approve') onApprove(note);
    else if (drawer === 'reject') onReject(note);
    setDrawer(null);
  }

  return (
    <>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setDrawer('reject')}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-destructive py-2.5">
          <Icon name="close-outline" size={16} tone="destructive" />
          <Text className="text-sm font-medium text-destructive">Tolak</Text>
        </Pressable>

        <Pressable
          onPress={() => setDrawer('approve')}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5">
          <Icon name="checkmark-outline" size={16} tone="inverse" />
          <Text className="text-sm font-medium text-primary-foreground">Setujui</Text>
        </Pressable>
      </View>

      <ReviewNoteDrawer
        visible={drawer !== null}
        title={drawer === 'approve' ? 'Setujui pengajuan?' : 'Tolak pengajuan?'}
        confirmLabel={drawer === 'approve' ? 'Setujui' : 'Tolak'}
        destructive={drawer === 'reject'}
        submitting={submitting}
        onClose={() => setDrawer(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

/** Alert konfirmasi ringan dipakai setelah aksi approval berhasil/gagal. */
export function showApprovalResult(result: { ok: true; message: string } | { ok: false; error: string }) {
  Alert.alert(result.ok ? 'Berhasil' : 'Gagal', result.ok ? result.message : result.error);
}
