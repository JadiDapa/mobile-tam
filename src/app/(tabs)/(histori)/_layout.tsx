import { Stack } from "expo-router/stack";

import { NotificationButton } from "@/components/notification-button";
import { ArrowButton } from "@/components/arrow-button";

export default function HistoriLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontFamily: "Nexa-Bold" } }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Histori",
          headerTitleAlign: "center",
          headerLeft: () => <ArrowButton />,
          headerRight: () => <NotificationButton />,
        }}
      />
    </Stack>
  );
}
