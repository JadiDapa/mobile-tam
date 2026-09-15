import { CameraView, useCameraPermissions } from "expo-camera";
import { File } from "expo-file-system";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

/** Style banner danger dipakai berulang di layar ini (overlay di atas kamera/foto). */
const dangerOverlayClass =
  "gap-2 rounded-2xl border border-red-400/60 bg-red-500/90 p-3 shadow-lg shadow-black/30";

import { FormInput } from "@/components/form-input";
import { Icon } from "@/components/icon";
import { formatLateDuration, lateMinutesFor } from "@/lib/date";
import { formatDistance, haversineDistance } from "@/lib/geo";
import {
  useFaceStatusQuery,
  useSettingsQuery,
  useSubmitAttendanceMutation,
} from "@/lib/queries";
import { MIN_DETAIL_LENGTH } from "@/lib/work-mode";

type Coords = { latitude: number; longitude: number; accuracy: number };

/** Batas menunggu sebelum menyerah dan memakai pembacaan terbaik yang ada. */
const POSITION_TIMEOUT_MS = 15_000;

function readPosition(acceptableAccuracy: number): Promise<Coords> {
  return new Promise((resolve, reject) => {
    let best: Coords | null = null;
    let settled = false;
    let subscription: Location.LocationSubscription | null = null;

    const settle = (result: Coords | null, error?: Error) => {
      if (settled) return;
      settled = true;

      clearTimeout(timer);
      subscription?.remove();

      if (result) resolve(result);
      else
        reject(error ?? new Error("Gagal membaca lokasi. Pastikan GPS aktif."));
    };

    const timer = setTimeout(() => settle(best), POSITION_TIMEOUT_MS);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
        mayShowUserSettingsDialog: true,
      },
      (position) => {
        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? Number.MAX_SAFE_INTEGER,
        };

        if (!best || coords.accuracy < best.accuracy) best = coords;
        if (coords.accuracy <= acceptableAccuracy) settle(coords);
      },
    )
      .then((sub) => {
        subscription = sub;
        if (settled) sub.remove();
      })
      .catch((error: unknown) =>
        settle(
          best,
          error instanceof Error
            ? error
            : new Error("Gagal membaca lokasi. Pastikan GPS aktif."),
        ),
      );
  });
}

export default function AttendanceCaptureScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const type: "CHECK_IN" | "CHECK_OUT" =
    params.type === "CHECK_OUT" ? "CHECK_OUT" : "CHECK_IN";
  const label = type === "CHECK_IN" ? "Absen Masuk" : "Absen Pulang";

  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const faceStatus = useFaceStatusQuery();
  const settings = useSettingsQuery();
  const submitMutation = useSubmitAttendanceMutation();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ uri: string } | null>(null);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const office = settings.data?.officeLocation ?? null;
  const maxAccuracyMeters =
    settings.data?.workSchedule?.maxAccuracyMeters ?? 100;

  const startLocating = useCallback(() => {
    setLocating(true);
    setLocationError(null);
    setAddress(null);

    readPosition(maxAccuracyMeters)
      .then((result) => {
        setCoords(result);

        Location.reverseGeocodeAsync({
          latitude: result.latitude,
          longitude: result.longitude,
        })
          .then((places) => {
            const place = places[0];
            if (!place) return;

            const parts = [place.street, place.subregion, place.city].filter(
              (part): part is string => Boolean(part),
            );
            if (parts.length > 0) setAddress(parts.join(", "));
          })
          .catch(() => {});
      })
      .catch((error: Error) => setLocationError(error.message))
      .finally(() => setLocating(false));
  }, [maxAccuracyMeters]);

  useEffect(() => {
    let cancelled = false;

    Location.requestForegroundPermissionsAsync().then((result) => {
      if (cancelled) return;

      if (!result.granted) {
        setLocationError(
          "Izin lokasi ditolak. Aktifkan izin lokasi lalu coba lagi.",
        );
        setLocating(false);
        return;
      }

      startLocating();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAccurate = coords !== null && coords.accuracy <= maxAccuracyMeters;

  const distanceMeters =
    coords && office
      ? haversineDistance(
          coords.latitude,
          coords.longitude,
          office.latitude,
          office.longitude,
        )
      : null;

  const isOutside =
    distanceMeters !== null &&
    office !== null &&
    distanceMeters > office.radiusMeters;
  const trimmedDetail = detail.trim();
  const isReasonComplete =
    !isOutside || trimmedDetail.length >= MIN_DETAIL_LENGTH;

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    setAutoSubmitFailed(false);

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.85,
      });
      if (!result) throw new Error("Gagal mengambil foto, coba lagi");
      setPhoto({ uri: result.uri });
    } catch (error) {
      Alert.alert(
        "Gagal",
        error instanceof Error ? error.message : "Gagal mengambil foto",
      );
    } finally {
      setCapturing(false);
    }
  }

  function retakePhoto() {
    setPhoto(null);
    setAutoSubmitFailed(false);
    setHasSubmitted(false);
  }

  const handleSubmit = useCallback(() => {
    if (!photo || !coords || submitting || hasSubmitted) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append("type", type);
    formData.append("latitude", String(coords.latitude));
    formData.append("longitude", String(coords.longitude));
    formData.append("accuracy", String(coords.accuracy));
    formData.append("photo", new File(photo.uri), "absensi.jpg");

    if (isOutside) {
      formData.append("workModeDetail", trimmedDetail);
    }

    submitMutation.mutate(formData, {
      onSuccess: (result) => {
        setSubmitting(false);

        if (!result.ok) {
          Alert.alert("Gagal", result.error);
          setAutoSubmitFailed(true);
          return;
        }

        setHasSubmitted(true);

        const now = new Date();
        const lateMinutes =
          type === "CHECK_IN"
            ? lateMinutesFor(
                now.toISOString(),
                now.toISOString().slice(0, 10),
                settings.data?.workDays ?? [],
              )
            : 0;
        const lateLine =
          lateMinutes > 0
            ? `Terlambat ${formatLateDuration(lateMinutes)}.`
            : null;
        const message = [result.warning, lateLine].filter(Boolean).join(" ");

        Alert.alert(result.message, message || undefined, [
          { text: "OK", onPress: () => router.back() },
        ]);
      },
      onError: (error) => {
        setSubmitting(false);
        setAutoSubmitFailed(true);
        Alert.alert(
          "Gagal",
          error instanceof Error ? error.message : "Gagal mengirim absensi",
        );
      },
    });
  }, [
    photo,
    coords,
    type,
    isOutside,
    trimmedDetail,
    submitting,
    hasSubmitted,
    submitMutation,
  ]);

  // Di dalam radius: begitu foto & lokasi siap, absensi terkirim otomatis —
  // sama seperti dashboard/components/employee/AttendanceDialog.tsx.
  useEffect(() => {
    if (
      !photo ||
      isOutside ||
      submitting ||
      !coords ||
      !isAccurate ||
      autoSubmitFailed ||
      hasSubmitted
    )
      return;

    // Ditunda lewat microtask supaya bukan setState sinkron di badan effect
    // (memicu cascading render) — sama seperti dashboard/components/employee/AttendanceDialog.tsx.
    queueMicrotask(() => handleSubmit());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    photo,
    coords,
    isAccurate,
    isOutside,
    submitting,
    autoSubmitFailed,
    hasSubmitted,
  ]);

  if (faceStatus.isPending || settings.isPending || !permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (faceStatus.data && !faceStatus.data.enrolled) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="text-center text-base text-text">
          Wajah kamu belum terdaftar. Daftarkan wajah dulu di halaman Profil
          sebelum bisa absen.
        </Text>
        <Pressable
          onPress={() => router.replace("/face-enrollment")}
          className="rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-medium text-primary-foreground">
            Daftarkan Wajah
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-muted-foreground">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  if (!office) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="text-center text-base text-text">
          Lokasi kantor belum diatur admin. Hubungi admin.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-primary">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-6">
        <StatusBar style="light" />
        <Text className="text-center text-base text-white">
          Aplikasi memerlukan akses kamera untuk verifikasi wajah saat absen.
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

  const canCapture = !capturing && !!coords && isAccurate;

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Lapisan media: kamera fullscreen sebelum foto, hasil foto fullscreen sesudahnya */}
      <View className="absolute inset-0">
        {photo ? (
          <Image
            source={{ uri: photo.uri }}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="front"
            mirror
          />
        )}
      </View>

      {/* Panduan wajah, hanya saat kamera masih live */}
      {!photo && (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
          style={{ paddingBottom: 120 }}
        >
          <View className="relative aspect-square w-[83%]">
            <Image
              source={require("@/assets/images/outline.png")}
              className="absolute left-0 top-0 size-14"
              resizeMode="contain"
            />
            <Image
              source={require("@/assets/images/outline.png")}
              className="absolute right-0 top-0 size-14"
              style={{ transform: [{ rotate: "90deg" }] }}
              resizeMode="contain"
            />
            <Image
              source={require("@/assets/images/outline.png")}
              className="absolute bottom-0 right-0 size-14"
              style={{ transform: [{ rotate: "180deg" }] }}
              resizeMode="contain"
            />
            <Image
              source={require("@/assets/images/outline.png")}
              className="absolute bottom-0 left-0 size-14"
              style={{ transform: [{ rotate: "270deg" }] }}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* Bar atas: kembali + status */}
      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => (photo ? retakePhoto() : router.back())}
          className="size-10 items-center justify-center rounded-full bg-black/40"
        >
          <Icon name="chevron-back" size={22} color="#ffffff" />
        </Pressable>

        {photo && (
          <View className="flex-row items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1">
            <Icon name="checkmark-circle-outline" size={14} color="#ffffff" />
            <Text className="text-xs font-medium text-white">Foto diambil</Text>
          </View>
        )}
      </View>

      {/* Danger overlay: di luar radius kantor, baru muncul setelah foto diambil */}
      {photo && isOutside && isAccurate && (
        <View
          className={dangerOverlayClass}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: insets.top + 64,
          }}
        >
          <View className="flex-row items-start gap-2">
            <Icon name="warning-outline" size={18} color="#ffffff" />
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold text-white">
                Kamu {formatDistance(distanceMeters!)} dari kantor
              </Text>
              <Text className="text-xs text-white/90">
                Absensi ini menunggu persetujuan admin dan tidak dihitung
                terlambat.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Loading overlay: menunggu lokasi terbaca / mengirim absensi */}
      {photo && (submitting || (!isOutside && (!coords || !isAccurate))) && (
        <View className="absolute inset-0 items-center justify-center gap-2 bg-black/55">
          <ActivityIndicator color="white" />
          <Text className="px-4 text-center text-sm font-medium text-white">
            {submitting ? "Mengirim absensi..." : "Menunggu lokasi terbaca..."}
          </Text>
        </View>
      )}

      {/* Tombol jepret, hanya saat kamera masih live */}
      {!photo && (
        <View
          className="absolute inset-x-0 bottom-0 items-center gap-4 px-4"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* Kartu lokasi: pengganti pil status di bar atas, dengan info lebih lengkap */}
          <View className="w-full gap-2 rounded-2xl bg-black/55 p-3">
            <View className="flex-row items-center gap-2">
              <Icon name="location-outline" size={16} color="#ffffff" />
              <Text className="flex-1 text-xs font-medium text-white">
                Lokasi Saat Ini
              </Text>
              <Pressable
                onPress={startLocating}
                disabled={locating}
                className="rounded-full bg-white/15 p-1.5 disabled:opacity-50"
              >
                <Icon name="refresh-outline" size={14} color="#ffffff" />
              </Pressable>
            </View>

            {locating && !coords ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-xs text-white/80">
                  Membaca lokasi...
                </Text>
              </View>
            ) : coords ? (
              <>
                <Text className="text-xs text-white" numberOfLines={2}>
                  {address ??
                    `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={
                      isAccurate
                        ? "size-1.5 rounded-full bg-emerald-400"
                        : "size-1.5 rounded-full bg-red-400"
                    }
                  />
                  <Text
                    className={
                      isAccurate
                        ? "text-xs text-emerald-200"
                        : "text-xs text-red-200"
                    }
                  >
                    Akurasi ±{Math.round(coords.accuracy)} m
                    {!isAccurate ? ` (maks ±${maxAccuracyMeters} m)` : ""}
                    {locating ? " · memperbarui" : ""}
                  </Text>
                </View>
                {!isAccurate && (
                  <Text className="text-[11px] text-white/70">
                    Pindah ke area terbuka lalu baca ulang lokasi.
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-xs text-red-200">
                {locationError ?? "Lokasi belum terbaca"}
              </Text>
            )}
          </View>

          <Text className="text-xs text-white/80">
            {coords && !isAccurate
              ? "Akurasi lokasi kurang"
              : !coords
                ? "Menunggu lokasi..."
                : "Posisikan wajah di dalam bingkai"}
          </Text>
          <Pressable
            onPress={handleCapture}
            disabled={!canCapture}
            className="size-20 items-center justify-center rounded-full border-4 border-white/40 bg-white/90 disabled:opacity-50"
          >
            {capturing ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <View className="size-16 rounded-full border-2 border-black/10 bg-white" />
            )}
          </Pressable>
        </View>
      )}

      {/* Bottom sheet: detail & aksi, muncul setelah foto diambil */}
      {photo && (
        <ScrollView
          className="absolute inset-x-0 bottom-0 max-h-[70%] rounded-t-3xl bg-background"
          contentContainerStyle={{
            gap: 12,
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-center text-lg font-bold text-text">
            {label}
          </Text>

          {coords && (
            <Text className="text-center text-xs text-muted-foreground">
              {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
            </Text>
          )}

          {isOutside && isAccurate && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Penjelasan</Text>
              <FormInput
                value={detail}
                onChangeText={setDetail}
                multiline
                numberOfLines={2}
                maxLength={300}
                placeholder="Contoh: kunjungan klien di Bekasi bersama Pak Adi"
                style={{ minHeight: 64, textAlignVertical: "top" }}
              />
              {trimmedDetail.length < MIN_DETAIL_LENGTH && (
                <Text className="text-xs text-muted-foreground">
                  Tulis minimal {MIN_DETAIL_LENGTH} karakter supaya admin bisa
                  menilainya.
                </Text>
              )}
              <Text className="text-xs text-muted-foreground">
                Sakit, izin, atau cuti tidak diajukan dari sini — pakai menu
                Izin &amp; Cuti.
              </Text>
            </View>
          )}

          {!isOutside && (
            <View className="flex-row gap-2">
              <Pressable
                onPress={retakePhoto}
                disabled={submitting}
                className="flex-1 items-center rounded-xl border border-border py-3.5 disabled:opacity-60"
              >
                <Text className="font-medium text-text">Ulangi</Text>
              </Pressable>

              {autoSubmitFailed && (
                <Pressable
                  onPress={handleSubmit}
                  disabled={!coords || !isAccurate || submitting}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60"
                >
                  {submitting && <ActivityIndicator color="white" />}
                  <Text className="font-medium text-primary-foreground">
                    Coba Lagi
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {isOutside && (
            <View className="flex-row gap-2">
              <Pressable
                onPress={retakePhoto}
                disabled={submitting}
                className="flex-1 items-center rounded-xl border border-border py-3.5 disabled:opacity-60"
              >
                <Text className="font-medium text-text">Ulangi</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={
                  !coords || !isAccurate || !isReasonComplete || submitting
                }
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60"
              >
                {submitting && <ActivityIndicator color="white" />}
                <Text className="font-medium text-primary-foreground">
                  Kirim Absensi
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
