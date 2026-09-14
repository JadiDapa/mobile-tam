import { View } from 'react-native';

import { Icon, type IoniconsIconName } from '@/components/icon';

/**
 * Rounded-square icon container used for Beranda menu items. Every item
 * shares the same box color and shadow — no per-item tinting.
 */
export function IconSquare({
  icon,
  size = 48,
}: {
  icon: IoniconsIconName;
  size?: number;
}) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center rounded-xl bg-accent shadow-sm shadow-black/5 dark:border dark:border-border dark:bg-background dark:shadow-none">
      <Icon name={icon} size={size * 0.46} tone="primary" />
    </View>
  );
}
