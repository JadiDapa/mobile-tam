import { Image } from "expo-image";
import { router } from "expo-router";
import { Dimensions, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";

const HERO_HEIGHT = Dimensions.get("window").height * 0.46;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 pt-40 pb-6 bg-background">
      <View
        style={{ height: HERO_HEIGHT }}
        className="items-center justify-center"
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: HERO_HEIGHT * 0.85,
            height: HERO_HEIGHT * 0.85,
            borderRadius: 9999,
            experimental_backgroundImage:
              "radial-gradient(circle, rgba(6,133,142,0.16), transparent 70%)",
          }}
        />
        <Image
          source={require("@/assets/images/welcome.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={200}
        />
      </View>

      <View className="justify-between px-6 pb-8 h-fit mt-auto gap-10">
        <View className="gap-3">
          <Text className="text-4xl font-semibold leading-tight text-text">
            Selamat Datang<Text className="font-bold">!</Text>
          </Text>
          <Text className="text-base leading-relaxed text-text font-thin">
            Aplikasi all in one internal seluruh kebutuhan karyawan Taruna
            Anugerah Mandiri
          </Text>
        </View>

        <View
          className="gap-4"
          style={{ paddingBottom: insets.bottom ? 0 : 4 }}
        >
          <Pressable
            onPress={() => router.push("/login")}
            className="w-full rounded-full bg-primary py-4 shadow-sm shadow-black/10 active:opacity-90"
          >
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Masuk
            </Text>
          </Pressable>

          <Text className="text-center text-xs text-muted-foreground">
            Belum punya akun? Hubungi admin untuk dibuatkan.
          </Text>
        </View>
      </View>
    </View>
  );
}
