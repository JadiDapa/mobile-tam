import { CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { Text } from "@/components/ui/text";
import { Icon } from "@/components/icon";
import {
  useEnrollFaceMutation,
  useFaceStatusQuery,
  useResetFaceMutation,
} from "@/lib/queries";

/**
 * Pendaftaran wajah.
 *
 * Kamera tetap menyala dan setiap jepretan langsung dikirim
 * satu per satu ke `/api/face`.
 */
export default function FaceEnrollmentScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);

  const faceStatus = useFaceStatusQuery();
  const enrollMutation = useEnrollFaceMutation();
  const resetMutation = useResetFaceMutation();

  const totalPhotos = faceStatus.data?.totalPhotos ?? 0;
  const minRequired = faceStatus.data?.minRequired ?? 1;
  const recommendedPhotos = faceStatus.data?.recommendedPhotos ?? 3;
  const maxPhotos = faceStatus.data?.maxPhotos ?? 5;

  const enrolled = totalPhotos >= minRequired;
  const atRecommended = totalPhotos >= recommendedPhotos;
  const atMax = totalPhotos >= maxPhotos;

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (!photo) {
        throw new Error("Gagal mengambil foto, coba lagi");
      }

      const formData = new FormData();

      formData.append("photo", new File(photo.uri), "enrollment.jpg");

      const result = await enrollMutation.mutateAsync(formData);

      if (!result.ok) {
        Alert.alert("Gagal", result.error);
      }
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error ? error.message : "Gagal mengambil foto",
      );
    } finally {
      setCapturing(false);
    }
  }

  function handleReset() {
    Alert.alert(
      "Hapus semua foto wajah?",
      `${totalPhotos} foto terdaftar akan dihapus. Kamu tidak akan bisa absen sampai mendaftar ulang minimal ${minRequired} foto.`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus & daftar ulang",
          style: "destructive",
          onPress: () => {
            resetMutation.mutate(undefined, {
              onError: () =>
                Alert.alert("Gagal", "Gagal menghapus data wajah, coba lagi"),
            });
          },
        },
      ],
    );
  }

  if (faceStatus.isPending || !permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <StatusBar style="light" />
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-6">
        <StatusBar style="light" />

        <Text className="text-center text-base text-white">
          Aplikasi memerlukan akses kamera untuk mendaftarkan wajah kamu.
        </Text>

        <Pressable
          onPress={requestPermission}
          className="rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-medium text-primary-foreground">
            Izinkan Akses Kamera
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Kamera fullscreen */}
      <View className="absolute inset-0">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
      </View>

      {/* Panduan wajah */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{ paddingBottom: 120 }}
      >
        <Image
          source={require("@/assets/images/outline.png")}
          className="aspect-square w-88 h-88"
          resizeMode="contain"
        />
      </View>

      {/* Bar atas */}
      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="size-10 items-center justify-center rounded-full bg-black/40"
        >
          <Icon name="chevron-back" size={22} color="#ffffff" />
        </Pressable>

        <View className="flex-row items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1">
          <Text className="text-xs text-white">
            {totalPhotos}/{atRecommended ? recommendedPhotos : minRequired} foto
          </Text>
        </View>
      </View>

      {/* Info status */}
      <View
        className="absolute inset-x-3 flex-row items-start gap-3 rounded-2xl bg-black/50 p-3"
        style={{ top: insets.top + 64 }}
      >
        <View
          className={
            enrolled
              ? "size-9 items-center justify-center rounded-full bg-primary/25"
              : "size-9 items-center justify-center rounded-full bg-white/15"
          }
        >
          <Icon
            name={enrolled ? "checkmark-circle-outline" : "id-card-outline"}
            color="#ffffff"
            size={20}
          />
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-white">
            {enrolled
              ? "Wajah kamu sudah terdaftar"
              : "Wajah kamu belum terdaftar"}
          </Text>

          <Text className="text-xs text-white/80">
            {atRecommended
              ? `${totalPhotos} foto tersimpan. Data ini dipakai untuk memverifikasi kamu saat absen.`
              : enrolled
                ? `${totalPhotos} foto tersimpan, kamu sudah bisa absen. Disarankan menambah hingga ${recommendedPhotos} foto dari sudut/pencahayaan berbeda untuk akurasi lebih baik.`
                : `Ambil minimal ${minRequired} foto wajah (disarankan ${recommendedPhotos}) dari sudut/pencahayaan berbeda (${totalPhotos}/${minRequired} tersimpan) sebelum bisa absen.`}
          </Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View
        className="absolute inset-x-0 bottom-0 gap-4 px-5"
        style={{
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Capture */}
        {!atMax && (
          <View className="items-center gap-3">
            <Pressable
              onPress={handleCapture}
              disabled={capturing || enrollMutation.isPending}
              className="size-20 items-center justify-center rounded-full bg-white disabled:opacity-60"
            >
              {capturing || enrollMutation.isPending ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Icon name="camera" size={30} color="#000000" />
              )}
            </Pressable>

            <Text className="text-sm font-medium text-white">
              {capturing || enrollMutation.isPending
                ? "Menyimpan foto..."
                : enrolled
                  ? "Tambah Foto Lagi"
                  : "Ambil & Simpan Foto"}
            </Text>
          </View>
        )}

        {/* Reset */}
        {totalPhotos > 0 && (
          <Pressable
            onPress={handleReset}
            disabled={resetMutation.isPending}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-black/40 py-2.5 disabled:opacity-60"
          >
            {resetMutation.isPending && <ActivityIndicator color="white" />}

            <Text className="text-sm font-medium text-red-300">
              Hapus &amp; daftar ulang
            </Text>
          </Pressable>
        )}

        {/* Done */}
        {enrolled && (
          <Pressable
            onPress={() => router.back()}
            className="items-center rounded-xl border border-white/40 bg-black/40 py-3.5"
          >
            <Text className="font-medium text-white">Selesai</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
