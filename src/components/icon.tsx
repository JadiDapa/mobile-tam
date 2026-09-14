import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export type { IoniconsIconName };

/**
 * Semantic color roles for icons — mirrors the text-color pairs already used
 * across the app (e.g. `text-primary`), so an icon next to text always lands
 * on the same hue as its label. Vector icons take a real color value (not a
 * className), so these read from the `Colors` hex mirror in `constants/theme.ts`
 * instead of Tailwind tokens — keep the two in sync.
 */
export type IconTone = 'default' | 'muted' | 'inverse' | 'primary' | 'success' | 'warning' | 'destructive';

const TONE_COLOR: Record<IconTone, { light: string; dark: string }> = {
  default: { light: Colors.light.text, dark: Colors.dark.text },
  muted: { light: Colors.light.mutedForeground, dark: Colors.dark.mutedForeground },
  inverse: { light: Colors.light.primaryForeground, dark: Colors.dark.primaryForeground },
  primary: { light: Colors.light.primary, dark: Colors.dark.primary },
  success: { light: '#059669', dark: '#34d399' }, // emerald-600 / emerald-400 (status color, not brand)
  warning: { light: '#d97706', dark: '#fbbf24' }, // amber-600 / amber-400 (status color, not brand)
  destructive: { light: Colors.light.destructive, dark: Colors.dark.destructive },
};

/** Icon sizes tied to the app's 4px spacing scale — pick the tier that matches surrounding text. */
export const IconSize = {
  /** Inline with caption/body text (text-xs / text-sm) */
  sm: 16,
  /** Default — inline with body text, row leading icons */
  md: 20,
  /** Section leading icons, avatar-adjacent icons */
  lg: 24,
  /** Icon-only buttons, empty-state illustrations */
  xl: 28,
} as const;

export function Icon({
  name,
  size = IconSize.md,
  tone = 'default',
  color,
}: {
  name: IoniconsIconName;
  size?: number;
  tone?: IconTone;
  color?: string;
}) {
  const scheme = useColorScheme();
  const resolved = color ?? TONE_COLOR[tone][scheme === 'dark' ? 'dark' : 'light'];

  return <Ionicons name={name} size={size} color={resolved} />;
}
