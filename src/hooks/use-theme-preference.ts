import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-preference';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Reads the stored preference and applies it via `Appearance.setColorScheme`.
 * Must run once at app startup (before the first screen renders) — otherwise
 * the app renders with the raw system scheme until whichever screen mounts
 * `useThemePreference` first (e.g. Profile), which is what previously caused
 * Beranda to show "system" while Profile showed the saved "dark".
 */
export async function loadStoredThemePreference(): Promise<ThemePreference> {
  const stored = await SecureStore.getItemAsync(STORAGE_KEY);
  const preference = isThemePreference(stored) ? stored : 'system';
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  return preference;
}

/**
 * App-wide light/dark/system selector. Backed by `Appearance.setColorScheme`,
 * which is what NativeWind's `dark:` classNames read on native and web, so
 * picking a preference here re-themes the whole app immediately.
 *
 * Assumes `loadStoredThemePreference` has already been called at startup
 * (in the root layout), so this only needs to read the current value for
 * display, not (re-)apply it.
 */
export function useThemePreference() {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      if (isThemePreference(stored)) {
        setPreferenceState(stored);
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
