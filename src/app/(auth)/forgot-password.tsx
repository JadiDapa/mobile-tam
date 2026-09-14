import { useSignIn } from '@clerk/expo/legacy';
import { isClerkAPIResponseError } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import { AuthField } from '@/components/auth-field';

const GENERIC_ERROR = 'Gagal mengirim kode. Periksa kembali email kamu.';

export default function ForgotPasswordScreen() {
  const { isLoaded, signIn } = useSignIn();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      router.push({ pathname: '/reset-password', params: { email } });
    } catch (err) {
      setError(isClerkAPIResponseError(err) ? (err.errors[0]?.longMessage ?? GENERIC_ERROR) : GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-8 px-6 py-10"
        keyboardShouldPersistTaps="handled">
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Icon name="key-outline" size={28} tone="primary" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-2xl font-bold text-text">Lupa password?</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Masukkan email akunmu, kami akan mengirim kode reset password.
            </Text>
          </View>
        </View>

        <View className="gap-4 rounded-card border border-border bg-card p-5 shadow-sm shadow-black/5 dark:shadow-none">
          <AuthField
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          {error && <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={submitting || !email}
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 shadow-sm shadow-black/10 disabled:opacity-60">
            {submitting && <ActivityIndicator color="white" />}
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Kirim kode
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
