import { isClerkAPIResponseError, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { PasswordInput } from '@/components/password-input';

const GENERIC_ERROR = 'Gagal mengganti password, silakan coba lagi';
const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordScreen() {
  const { user } = useUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!currentPassword) return 'Password saat ini wajib diisi';
    if (newPassword.length < MIN_PASSWORD_LENGTH) return `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter`;
    if (newPassword !== confirmPassword) return 'Konfirmasi password tidak cocok';
    if (newPassword === currentPassword) return 'Password baru harus berbeda dari password saat ini';
    return null;
  };

  const onSubmit = async () => {
    if (!user || submitting) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });

      Alert.alert('Berhasil', 'Password berhasil diganti', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
      <ScrollView contentContainerClassName="gap-4 p-5" keyboardShouldPersistTaps="handled">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Password saat ini</Text>
          <PasswordInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoComplete="current-password"
            placeholder="Masukkan password saat ini"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Password baru</Text>
          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            autoComplete="new-password"
            placeholder="Masukkan password baru"
          />
          <Text className="text-xs text-muted-foreground">Minimal {MIN_PASSWORD_LENGTH} karakter.</Text>
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-text">Ulangi password baru</Text>
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
          />
        </View>

        {error && <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
          className="mt-2 w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 disabled:opacity-60">
          {submitting && <ActivityIndicator color="white" />}
          <Text className="text-center text-base font-semibold text-primary-foreground">
            Simpan Password
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
