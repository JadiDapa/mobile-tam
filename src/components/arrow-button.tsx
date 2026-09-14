import { Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Icon } from "@/components/icon";

export function ArrowButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} hitSlop={8}>
      <Icon name="arrow-back" size={24} />
    </Pressable>
  );
}
