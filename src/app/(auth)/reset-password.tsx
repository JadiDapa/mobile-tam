import { useSignIn } from '@clerk/expo/legacy';
import { isClerkAPIResponseError } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon } from '@/components/icon';
import { AuthField, AuthPasswordField } from '@/components/auth-field';

const GENERIC_ERROR = 'Kode tidak valid atau sudah kedaluwarsa';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      });

      if (attempt.status === 'needs_new_password') {
        const result = await signIn.resetPassword({ password });

        if (result.status !== 'complete') {
          setError(GENERIC_ERROR);
          return;
        }

        await setActive({ session: result.createdSessionId });
        router.replace('/home');
        return;
      }

      setError(GENERIC_ERROR);
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
            <Icon name="shield-checkmark-outline" size={28} tone="primary" />
          </View>
          <View className="items-center gap-1.5">
            <Text className="text-2xl font-bold text-text">Buat password baru</Text>
            <Text className="text-center text-sm text-muted-foreground">
              {email
                ? `Masukkan kode yang dikirim ke ${email} dan password barumu.`
                : 'Masukkan kode reset dan password barumu.'}
            </Text>
          </View>
        </View>

        <View className="gap-4 rounded-card border border-border bg-card p-5 shadow-sm shadow-black/5 dark:shadow-none">
          <AuthField
            icon="keypad-outline"
            placeholder="Kode 6 digit"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />

          <AuthPasswordField
            placeholder="Password baru"
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
          />

          {error && <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={submitting || !code || !password}
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 shadow-sm shadow-black/10 disabled:opacity-60">
            {submitting && <ActivityIndicator color="white" />}
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Simpan password
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text className="text-center text-sm font-medium text-primary">Kirim ulang kode</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
