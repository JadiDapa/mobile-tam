import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

import { TabBar } from "@/components/tab-bar";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="(beranda)" options={{ title: "Beranda" }} />
      <Tabs.Screen name="(histori)" options={{ title: "Histori" }} />
      <Tabs.Screen name="(izin)" options={{ title: "Izin" }} />
      <Tabs.Screen name="(lembur)" options={{ title: "Lembur" }} />
      <Tabs.Screen name="(approval)" options={{ title: "Review" }} />
      <Tabs.Screen name="(profile)" options={{ title: "Profile" }} />
    </Tabs>
  );
}
