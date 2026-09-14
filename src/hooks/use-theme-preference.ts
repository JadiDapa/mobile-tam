import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-preference';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * App-wide light/dark/system selector. Backed by `Appearance.setColorScheme`,
 * which is what NativeWind's `dark:` classNames read on native and web, so
 * picking a preference here re-themes the whole app immediately.
 */
export function useThemePreference() {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      if (isThemePreference(stored)) {
        setPreferenceState(stored);
        Appearance.setColorScheme(stored === 'system' ? 'unspecified' : stored);
      }
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    Appearance.setColorScheme(next === 'system' ? 'unspecified' : next);
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {});
  }, []);

  return { preference, setPreference };
}
