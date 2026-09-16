import { useClerk } from '@clerk/expo';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Switch, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Avatar } from '@/components/avatar';
import { Icon, type IoniconsIconName } from '@/components/icon';
import { SimpleRow } from '@/components/simple-row';
import { type ThemePreference, useThemePreference } from '@/hooks/use-theme-preference';
import { useFaceStatusQuery, useMeQuery } from '@/lib/queries';

const THEME_MODE_LABEL: Record<ThemePreference, string> = {
  light: 'Terang',
  dark: 'Gelap',
  system: 'Sistem',
};

const THEME_MODES: ThemePreference[] = ['light', 'dark', 'system'];

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function formatShortDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: IoniconsIconName;
  label: string;
  value: string;
}) {
  return (
    <View className="w-1/2 flex-row items-start gap-2 py-2 pr-2">
      <Icon name={icon} size={18} tone="muted" />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {label}
        </Text>
        <Text numberOfLines={1} className="text-sm font-medium text-text">
          {value}
        </Text>
      </View>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  showBorder,
}: {
  icon: IoniconsIconName;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  showBorder: boolean;
}) {
  return (
    <View
      className={
        showBorder
          ? 'flex-row items-center gap-3 border-b border-border py-3'
          : 'flex-row items-center gap-3 py-3'
      }>
      <Icon name={icon} size={20} tone="muted" />
      <View className="flex-1">
        <Text className="text-sm font-medium text-text">{label}</Text>
        {subtitle && (
          <Text numberOfLines={1} className="text-xs text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const me = useMeQuery();
  const faceStatus = useFaceStatusQuery();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const { preference: themeMode, setPreference: setThemeMode } = useThemePreference();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  if (me.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (me.isError || !me.data) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="text-center text-muted-foreground">
          Gagal memuat profil.
        </Text>
        <Pressable onPress={() => me.refetch()} className="rounded-xl bg-primary px-6 py-3">
          <Text className="font-medium text-primary-foreground">Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  const user = me.data;

  const personalInfo: { icon: IoniconsIconName; label: string; value: string }[] = [
    { icon: 'calendar-outline', label: 'Tanggal Bergabung', value: formatShortDate(user.createdAt) },
    { icon: 'briefcase-outline', label: 'Jabatan', value: user.position ?? '-' },
    { icon: 'mail-outline', label: 'Email', value: user.email },
    { icon: 'call-outline', label: 'Nomor Telepon', value: user.phone ?? '-' },
  ];

  const faceSubtitle = faceStatus.data
    ? `${faceStatus.data.totalPhotos}/${faceStatus.data.minRequired} foto terdaftar`
    : '...';

  const isRefreshing = me.isRefetching || faceStatus.isRefetching;
  const onRefresh = () => {
    me.refetch();
    faceStatus.refetch();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <View className="h-28 bg-primary" />

      <View className="-mt-12 gap-1 px-5">
        <View className="items-center">
          <Avatar name={user.name} imageUri={user.profileImageUrl} size={88} />
        </View>

        <View className="items-center gap-0.5 pt-1">
          <Text className="text-lg font-bold text-text">{user.name}</Text>
          <Text className="text-sm text-muted-foreground">
            {user.position ?? (user.role === 'ADMIN' ? 'Admin' : 'Staff')}
          </Text>
        </View>
      </View>

      <View className="gap-5 p-5">
        <View className="gap-2">
          <Text className="text-sm font-bold text-text">Informasi Pribadi</Text>
          <View className="flex-row flex-wrap rounded-2xl bg-muted p-3">
            {personalInfo.map((item) => (
              <InfoField key={item.label} icon={item.icon} label={item.label} value={item.value} />
            ))}
          </View>
        </View>

        <View className="rounded-2xl bg-muted px-3">
          <SimpleRow
            icon="id-card-outline"
            label="Verifikasi Wajah"
            subtitle={faceSubtitle}
            onPress={() => router.push('/face-enrollment')}
            showBorder
          />
          <SimpleRow
            icon="folder-open-outline"
            label="Data Kepegawaian Lengkap"
            subtitle="Identitas, kontak, dokumen, dan lainnya"
            onPress={() => router.push('/employee-data')}
            showBorder
          />
          <SimpleRow
            icon="lock-closed-outline"
            label="Ubah Password"
            onPress={() => router.push('/change-password')}
            showBorder={false}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-bold text-text">Preferensi</Text>

          <View className="rounded-2xl bg-muted px-3">
            <ToggleRow
              icon="notifications-outline"
              label="Notifikasi Push"
              subtitle="Terima notifikasi absensi & pengajuan"
              value={pushEnabled}
              onValueChange={setPushEnabled}
              showBorder
            />
            <ToggleRow
              icon="alarm-outline"
              label="Pengingat Absen"
              subtitle="Ingatkan jika belum absen masuk/pulang"
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              showBorder={false}
            />
          </View>

          <View className="flex-row gap-1 rounded-2xl bg-muted p-1">
            {THEME_MODES.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setThemeMode(mode)}
                className={
                  mode === themeMode
                    ? 'flex-1 items-center rounded-xl bg-primary py-2'
                    : 'flex-1 items-center rounded-xl py-2'
                }>
                <Text
                  className={
                    mode === themeMode
                      ? 'text-sm font-medium text-background'
                      : 'text-sm text-muted-foreground'
                  }>
                  {THEME_MODE_LABEL[mode]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-bold text-text">Perangkat & Sesi</Text>
          <View className="rounded-2xl bg-muted px-3">
            <SimpleRow
              icon="phone-portrait-outline"
              label="Perangkat Aktif"
              subtitle="1 perangkat"
              onPress={() => {}}
              showBorder={false}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-bold text-text">Lainnya</Text>
          <View className="rounded-2xl bg-muted px-3">
            <SimpleRow
              icon="globe-outline"
              label="Bahasa"
              subtitle="Indonesia"
              onPress={() => {}}
              showBorder
            />
            <SimpleRow icon="document-outline" label="Kebijakan Privasi" onPress={() => {}} showBorder />
            <SimpleRow icon="clipboard-outline" label="Syarat & Ketentuan" onPress={() => {}} showBorder />
            <SimpleRow
              icon="information-circle-outline"
              label="Tentang Aplikasi"
              subtitle={`v${Application.nativeApplicationVersion}`}
              onPress={() => {}}
              showBorder={false}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="items-center rounded-xl bg-destructive/10 py-3">
          <Text className="text-sm font-medium text-destructive">Keluar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
