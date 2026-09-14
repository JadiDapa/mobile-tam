import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { type IoniconsIconName } from "@/components/icon";
import { IconSquare } from "@/components/ui/icon-square";

const MENU_ITEMS: {
  icon: IoniconsIconName;
  label: string;
  href?: Parameters<typeof router.push>[0];
}[] = [
  { icon: "checkmark-done-outline", label: "Absensi", href: "/(tabs)/(histori)" },
  { icon: "document-text-outline", label: "Izin", href: "/(tabs)/(izin)" },
  { icon: "timer-outline", label: "Lembur", href: "/(tabs)/(lembur)" },
  { icon: "briefcase-outline", label: "Dinas Luar", href: "/dinas-luar" },
  { icon: "person-outline", label: "Profil", href: "/(tabs)/(profile)" },
  { icon: "document-outline", label: "Dokumen", href: "/employee-data-documents" },
  { icon: "megaphone-outline", label: "Pengumuman" },
  { icon: "grid-outline", label: "Lainnya" },
];

export function MenuGrid() {
  return (
    <View className="flex-row flex-wrap">
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.label}
          onPress={() => item.href && router.push(item.href)}
          className="w-1/4 items-center gap-2 py-2"
        >
          <IconSquare icon={item.icon} />
          <Text
            numberOfLines={1}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
