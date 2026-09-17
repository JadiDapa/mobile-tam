import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { NotificationButton } from "@/components/notification-button";
import { UpdateModal } from "@/components/update-modal";
import { useClearQueryCacheOnUserChange } from "@/hooks/use-clear-query-cache-on-user-change";
import { useOtaUpdates } from "@/hooks/use-ota-updates";
import { loadStoredThemePreference } from "@/hooks/use-theme-preference";

import "../../global.css";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — set it in .env (same value as the dashboard's NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, same Clerk instance).",
  );
}

/** Dipasang di dalam `ClerkProvider` supaya `useAuth()` tersedia. */
function QueryCacheResetOnUserChange({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  useClearQueryCacheOnUserChange(queryClient);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());
  // OTA (JS/asset) updates run first; the manual APK check (native/SDK changes)
  // only fires once we know no OTA update is available or already pending —
  // no point prompting for a full APK download if a same-runtime OTA fix is
  // about to be applied instead.
  const { isUpdateAvailable, isUpdatePending } = useOtaUpdates();
  const manualCheckEnabled = !isUpdateAvailable && !isUpdatePending;
  const [fontsLoaded] = useFonts({
    "Nexa-Light": require("@/assets/fonts/montserrat/Montserrat-Light.ttf"),
    "Nexa-Regular": require("@/assets/fonts/montserrat/Montserrat-Regular.ttf"),
    "Nexa-Bold": require("@/assets/fonts/montserrat/Montserrat-Bold.ttf"),
    "Nexa-Black": require("@/assets/fonts/montserrat/Montserrat-Black.ttf"),
  });
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loadStoredThemePreference().finally(() => setThemeLoaded(true));
  }, []);

  if (!fontsLoaded || !themeLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <QueryCacheResetOnUserChange queryClient={queryClient} />
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AnimatedSplashOverlay />
          <UpdateModal enabled={manualCheckEnabled} />
          <Stack
            screenOptions={{
              headerShown: false,
              headerTitleStyle: { fontFamily: "Nexa-Bold" },
              headerStyle: { backgroundColor: "transparent" },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="attendance-capture" />
            <Stack.Screen name="face-enrollment" />
            <Stack.Screen
              name="change-password"
              options={{ headerShown: true, title: "Ubah Password" }}
            />
            <Stack.Screen
              name="notifications"
              options={{ headerShown: true, title: "Notifikasi" }}
            />
            <Stack.Screen
              name="leave-request-sakit"
              options={{ headerShown: true, title: "Ajukan Sakit" }}
            />
            <Stack.Screen
              name="leave-request-izin"
              options={{ headerShown: true, title: "Ajukan Izin" }}
            />
            <Stack.Screen
              name="leave-request-cuti"
              options={{ headerShown: true, title: "Ajukan Cuti" }}
            />
            <Stack.Screen
              name="field-assignment-create"
              options={{ headerShown: true, title: "Buat Penugasan" }}
            />
            <Stack.Screen
              name="dinas-luar"
              options={{
                headerShown: true,
                title: "Dinas Luar",
                headerRight: () => <NotificationButton />,
              }}
            />
            <Stack.Screen
              name="approval-leave"
              options={{ headerShown: true, title: "Pengajuan Izin" }}
            />
            <Stack.Screen
              name="approval-overtime"
              options={{ headerShown: true, title: "Pengajuan Lembur" }}
            />
            <Stack.Screen
              name="approval-attendance-verification"
              options={{ headerShown: true, title: "Verifikasi Absensi" }}
            />
            <Stack.Screen
              name="approval-field-assignment"
              options={{ headerShown: true, title: "Dinas Luar" }}
            />
            <Stack.Screen
              name="employee-data"
              options={{ headerShown: true, title: "Data Kepegawaian Lengkap" }}
            />
            <Stack.Screen
              name="employee-data-identity"
              options={{ headerShown: true, title: "Identitas Pribadi" }}
            />
            <Stack.Screen
              name="employee-data-contact"
              options={{ headerShown: true, title: "Kontak" }}
            />
            <Stack.Screen
              name="employee-data-employment"
              options={{ headerShown: true, title: "Data Kepegawaian" }}
            />
            <Stack.Screen
              name="employee-data-work-history"
              options={{ headerShown: true, title: "Riwayat Pekerjaan" }}
            />
            <Stack.Screen
              name="employee-data-training"
              options={{ headerShown: true, title: "Pelatihan" }}
            />
            <Stack.Screen
              name="employee-data-documents"
              options={{ headerShown: true, title: "Dokumen Administrasi" }}
            />
            <Stack.Screen
              name="rekapan-absen"
              options={{ headerShown: true, title: "Rekapan Absen" }}
            />
            <Stack.Screen
              name="admin-users"
              options={{ headerShown: true, title: "Daftar Pengguna" }}
            />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
