import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { AnimatedIcon } from '@/components/animated-icon';

const SPLASH_DURATION_MS = 1500;

export default function SplashScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = setTimeout(() => {
      router.replace(isSignedIn ? '/home' : '/welcome');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <AnimatedIcon />
      <Text className="text-2xl font-semibold text-text">TAM</Text>
    </View>
  );
}
