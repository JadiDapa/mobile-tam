import { Stack } from "expo-router/stack";

import { NotificationButton } from "@/components/notification-button";
import { ArrowButton } from "@/components/arrow-button";

export default function ApprovalLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontFamily: "Nexa-Bold" } }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Review",
          headerTitleAlign: "center",
          headerLeft: () => <ArrowButton />,
          headerRight: () => <NotificationButton />,
        }}
      />
    </Stack>
  );
}
