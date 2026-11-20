import { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, IconSize } from '@/components/icon';
import {
  ADMIN_CONTACT_EMAIL,
  CONTACT_ADMIN_DESCRIPTION,
  CONTACT_ADMIN_OPEN_FAILED,
  CONTACT_ADMIN_TITLE,
  contactAdminMailto,
} from '@/lib/contact-admin';

/**
 * Pengganti layar request account publik: akun hanya dibuat admin, jadi calon
 * karyawan diarahkan menghubungi admin lewat email (sama dengan dialog web).
 *
 * Tidak ada tombol salin — modul clipboard adalah modul native (berarti APK
 * baru). Email ditampilkan sebagai teks `selectable`, jadi bisa disalin dengan
 * tekan lama lewat menu bawaan sistem.
 */
export function ContactAdminDialog({ textClassName = 'text-sm' }: { textClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);

  function close() {
    setOpen(false);
    setOpenFailed(false);
  }

  function sendEmail() {
    setOpenFailed(false);
    // `openURL` menolak kalau tidak ada aplikasi yang menangani `mailto:`.
    Linking.openURL(contactAdminMailto()).catch(() => setOpenFailed(true));
  }

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={8}>
        <Text className={`text-center text-muted-foreground ${textClassName}`}>
          Belum punya akun? <Text className="font-medium text-primary">Hubungi admin</Text>
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View className="flex-1 items-center justify-center bg-black/50 p-6">
          {/* Latar terpisah dari kartu: kartu bukan Pressable, jadi tekan lama di email tetap sampai ke teks. */}
          <Pressable onPress={close} style={StyleSheet.absoluteFill} accessibilityLabel="Tutup" />
          <View className="w-full gap-4 rounded-2xl bg-card p-5">
            <View className="gap-1.5">
              <Text className="text-center text-base font-bold text-text">{CONTACT_ADMIN_TITLE}</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {CONTACT_ADMIN_DESCRIPTION}
              </Text>
            </View>

            <View className="rounded-xl border border-border bg-background px-3 py-3">
              <Text selectable className="text-center text-sm font-medium text-text">
                {ADMIN_CONTACT_EMAIL}
              </Text>
            </View>
            <Text className="-mt-2 text-center text-xs text-muted-foreground">
              Tekan lama email untuk menyalin
            </Text>

            {openFailed && (
              <Text className="text-center text-xs text-red-600 dark:text-red-400">
                {CONTACT_ADMIN_OPEN_FAILED}
              </Text>
            )}

            <Pressable
              onPress={sendEmail}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5">
              <Icon name="mail-outline" size={IconSize.sm} tone="inverse" />
              <Text className="font-medium text-primary-foreground">Kirim email</Text>
            </Pressable>

            <Pressable onPress={close} className="items-center py-2">
              <Text className="text-sm text-muted-foreground">Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
