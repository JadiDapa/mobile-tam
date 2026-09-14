import { useSignIn } from '@clerk/expo/legacy';
import { isClerkAPIResponseError } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { AnimatedIcon } from '@/components/animated-icon';
import { AuthField, AuthPasswordField } from '@/components/auth-field';

const GENERIC_ERROR = 'Email atau password salah';

export default function LoginScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status !== 'complete') {
        // MVP: cuma strategi email+password, tidak ada faktor tambahan.
        setError(GENERIC_ERROR);
        return;
      }

      await setActive({ session: result.createdSessionId });
      router.replace('/home');
    } catch (err) {
      setError(
        isClerkAPIResponseError(err)
          ? (err.errors[0]?.longMessage ?? GENERIC_ERROR)
          : GENERIC_ERROR,
      );
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
          <AnimatedIcon />
          <View className="items-center gap-1.5">
            <Text className="text-2xl font-bold text-text">Selamat datang kembali</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Masuk untuk melanjutkan presensi hari ini.
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

          <View className="gap-2">
            <AuthPasswordField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              autoComplete="current-password"
            />
            <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} className="self-end">
              <Text className="text-sm font-medium text-primary">Lupa password?</Text>
            </Pressable>
          </View>

          {error && (
            <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>
          )}

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 shadow-sm shadow-black/10 disabled:opacity-60">
            {submitting && <ActivityIndicator color="white" />}
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Masuk
            </Text>
          </Pressable>
        </View>

        <Text className="text-center text-sm text-muted-foreground">
          Belum punya akun? Hubungi admin untuk dibuatkan.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
