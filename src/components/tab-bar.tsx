import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IoniconsIconName } from "@/components/icon";
import { useMeQuery } from "@/lib/queries";

const ROUTE_META: Record<
  string,
  { label: string; icon: IoniconsIconName; iconActive: IoniconsIconName }
> = {
  "(beranda)": { label: "Beranda", icon: "home-outline", iconActive: "home" },
  "(histori)": { label: "Histori", icon: "time-outline", iconActive: "time" },
  "(izin)": {
    label: "Izin",
    icon: "document-text-outline",
    iconActive: "document-text",
  },
  "(lembur)": { label: "Lembur", icon: "timer-outline", iconActive: "timer" },
  "(approval)": {
    label: "Review",
    icon: "checkmark-done-outline",
    iconActive: "checkmark-done",
  },
  "(profile)": {
    label: "Profile",
    icon: "person-outline",
    iconActive: "person",
  },
};

/** Tab yang hanya tampil untuk role tertentu — tab lain di ROUTE_META tampil untuk semua role. */
const ROLE_ONLY_ROUTES: Record<string, ("ADMIN" | "SUPERVISOR" | "MANAGER")[]> = {
  "(approval)": ["ADMIN", "SUPERVISOR", "MANAGER"],
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const me = useMeQuery();
  const role = me.data?.role;

  return (
    <View
      className="flex-row items-start justify-between border-t border-border bg-background px-2 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {state.routes.map((route, index) => {
        const meta = ROUTE_META[route.name];
        if (!meta) return null;

        const allowedRoles = ROLE_ONLY_ROUTES[route.name];
        if (allowedRoles && (!role || !(allowedRoles as string[]).includes(role))) return null;

        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center gap-1"
          >
            <View
              className={
                focused
                  ? "items-center justify-center rounded-full bg-background px-4 py-1.5"
                  : "items-center justify-center px-4 py-1.5"
              }
            >
              <Icon
                name={focused ? meta.iconActive : meta.icon}
                size={22}
                tone={focused ? "primary" : "muted"}
              />
            </View>
            <Text
              numberOfLines={1}
              className={
                focused
                  ? "text-[10px] font-semibold text-primary"
                  : "text-[10px] font-medium text-muted-foreground"
              }
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
