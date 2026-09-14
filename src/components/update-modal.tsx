import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { checkForApkUpdate } from '@/lib/version-check';

/**
 * Shows when the manual APK version check (`checkForApkUpdate`) finds a newer
 * build than the installed one. Dismissible for the current session only — it
 * has no "don't show again" persistence, so it reappears on the next launch
 * while the installed APK is still outdated.
 */
export function UpdateModal({ enabled }: { enabled: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [update, setUpdate] = useState<{
    apkUrl: string;
    notes?: string;
    latestVersion?: string;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    checkForApkUpdate().then((result) => {
      if (result.updateAvailable && result.apkUrl) {
        setUpdate({ apkUrl: result.apkUrl, notes: result.notes, latestVersion: result.latestVersion });
      }
    });
  }, [enabled]);

  const visible = !!update && !dismissed;
  if (!visible || !update) return null;

  function handleDownload() {
    Linking.openURL(update!.apkUrl).catch((error) => {
      console.warn('[update-modal] failed to open apkUrl', error);
    });
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setDismissed(true)}>
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View className="w-full gap-4 rounded-2xl bg-card p-5">
          <Text className="text-center text-base font-bold text-text">
            Versi Baru Tersedia{update.latestVersion ? ` (${update.latestVersion})` : ''}
          </Text>

          {update.notes && (
            <Text className="text-center text-sm text-muted-foreground">{update.notes}</Text>
          )}

          <Pressable onPress={handleDownload} className="items-center rounded-xl bg-primary py-3.5">
            <Text className="font-medium text-primary-foreground">Unduh Update</Text>
          </Pressable>

          <Pressable onPress={() => setDismissed(true)} className="items-center py-2">
            <Text className="text-sm text-muted-foreground">Nanti Saja</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
