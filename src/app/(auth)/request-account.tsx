import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import { AuthField, AuthPasswordField } from '@/components/auth-field';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const GENERIC_ERROR = 'Gagal mengirim pengajuan. Coba lagi.';

export default function RequestAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    if (submitting) return;

    setError(null);

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/account-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, confirmPassword }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? GENERIC_ERROR);
        return;
      }

      setSubmitted(true);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <KeyboardAvoidingView className="flex-1 bg-background">
        <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-6 px-6 py-10">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Icon name="checkmark-circle-outline" size={28} tone="primary" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-2xl font-bold text-text">Pengajuan terkirim</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Permintaan pembuatan akun kamu sudah dikirim dan menunggu persetujuan admin. Kamu akan bisa masuk
              setelah disetujui.
            </Text>
          </View>

          <Pressable
            onPress={() => router.replace('/login')}
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 shadow-sm shadow-black/10">
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Kembali ke halaman masuk
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-8 px-6 py-10"
        keyboardShouldPersistTaps="handled">
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Icon name="person-add-outline" size={28} tone="primary" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-2xl font-bold text-text">Ajukan pembuatan akun</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Isi data di bawah ini, admin akan meninjau dan menyetujui pengajuanmu.
            </Text>
          </View>
        </View>

        <View className="gap-4 rounded-card border border-border bg-card p-5 shadow-sm shadow-black/5 dark:shadow-none">
          <AuthField
            icon="person-outline"
            placeholder="Nama lengkap"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />

          <AuthField
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <AuthField
            icon="call-outline"
            placeholder="Nomor HP (opsional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <AuthPasswordField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
          />

          <AuthPasswordField
            placeholder="Konfirmasi password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="new-password"
          />

          {error && <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={submitting || !name || !email || !password || !confirmPassword}
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 shadow-sm shadow-black/10 disabled:opacity-60">
            {submitting && <ActivityIndicator color="white" />}
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Kirim pengajuan
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text className="text-center text-sm font-medium text-primary">Kembali ke masuk</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
