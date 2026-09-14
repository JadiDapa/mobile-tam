import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Drives the EAS Update (OTA) flow using the built-in `Updates.useUpdates()` hook.
 * Confirmed present in the installed expo-updates version (57.0.22, SDK 57) — it
 * ships since expo-updates ~0.24 / SDK 50+. If a future downgrade ever drops it,
 * this needs to fall back to manual `Updates.checkForUpdateAsync()` /
 * `Updates.fetchUpdateAsync()` polling instead (a hook can't call itself
 * conditionally, so that fallback would need its own code path, not a runtime
 * `typeof` check here).
 *
 * Never throws: OTA checks should never crash the app. Offline devices and dev mode
 * (`__DEV__`, where expo-updates is disabled) both fail silently.
 */
export function useOtaUpdates() {
  const alertShownRef = useRef(false);

  const updates = Updates.useUpdates();

  const isUpdateAvailable = updates.isUpdateAvailable;
  const isUpdatePending = updates.isUpdatePending;
  const checkError = updates.checkError;
  const downloadError = updates.downloadError;

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    if (!isUpdateAvailable || isUpdatePending) return;

    Updates.fetchUpdateAsync().catch((error) => {
      console.warn('[ota-updates] fetchUpdateAsync failed', error);
    });
  }, [isUpdateAvailable, isUpdatePending]);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    if (!isUpdatePending || alertShownRef.current) return;

    alertShownRef.current = true;
    Alert.alert('Update Tersedia', 'Versi baru aplikasi sudah siap. Muat ulang sekarang?', [
      { text: 'Nanti', style: 'cancel' },
      {
        text: 'Muat Ulang',
        onPress: () => {
          Updates.reloadAsync().catch((error) => {
            console.warn('[ota-updates] reloadAsync failed', error);
          });
        },
      },
    ]);
  }, [isUpdatePending]);

  useEffect(() => {
    if (checkError) console.warn('[ota-updates] checkError', checkError);
  }, [checkError]);

  useEffect(() => {
    if (downloadError) console.warn('[ota-updates] downloadError', downloadError);
  }, [downloadError]);

  return {
    isUpdateAvailable,
    isUpdatePending,
    currentlyRunning: updates.currentlyRunning,
  };
}
