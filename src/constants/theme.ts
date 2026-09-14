/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/**
 * Kept in sync with the CSS variables in `global.css` (`--text`, `--background`,
 * `--primary`, `--secondary`, `--accent`, `--muted`, `--card`, `--border`, `--ring`,
 * `--destructive`, and their `-foreground` pairs). NativeWind/Tailwind classNames
 * should prefer those `oklch()` tokens directly (e.g. `bg-primary`); this hex mirror
 * only exists for the plain React Native `style` prop path (`ThemedText`/`ThemedView`),
 * which can't consume CSS variables.
 */
export const Colors = {
  light: {
    text: '#0A4A55',
    background: '#E8F0F0',
    primary: '#06858E',
    primaryForeground: '#FFFFFF',
    secondary: '#D9EAEA',
    secondaryForeground: '#0A4A55',
    accent: '#C9E5E7',
    accentForeground: '#0A4A55',
    muted: '#E0EAEA',
    mutedForeground: '#427A7E',
    card: '#F2F7F7',
    cardForeground: '#0A4A55',
    border: '#CDE0E2',
    ring: '#06858E',
    destructive: '#D13838',
    destructiveForeground: '#FFFFFF',
    backgroundElement: '#E0EAEA',
    backgroundSelected: '#D9EAEA',
    textSecondary: '#427A7E',
  },
  dark: {
    text: '#D6EDED',
    background: '#0A1A20',
    primary: '#06858E',
    primaryForeground: '#FFFFFF',
    secondary: '#164955',
    secondaryForeground: '#D6EDED',
    accent: '#164955',
    accentForeground: '#D6EDED',
    muted: '#0F3039',
    mutedForeground: '#849E9E',
    card: '#0C2025',
    cardForeground: '#D6EDED',
    border: '#164955',
    ring: '#06858E',
    destructive: '#E83C3C',
    destructiveForeground: '#F2F2F2',
    backgroundElement: '#0F3039',
    backgroundSelected: '#164955',
    textSecondary: '#849E9E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
