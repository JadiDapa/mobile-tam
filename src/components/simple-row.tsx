import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, type IoniconsIconName } from '@/components/icon';

export function SimpleRow({
  icon,
  label,
  subtitle,
  onPress,
  showBorder,
  destructive,
}: {
  icon: IoniconsIconName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showBorder: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={
        showBorder
          ? 'flex-row items-center gap-3 border-b border-border py-3'
          : 'flex-row items-center gap-3 py-3'
      }>
      <Icon name={icon} size={20} tone={destructive ? 'destructive' : 'muted'} />
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={
            destructive
              ? 'text-sm font-medium text-destructive'
              : 'text-sm font-medium text-text'
          }>
          {label}
        </Text>
        {subtitle && (
          <Text numberOfLines={1} className="text-xs text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </View>
      <Icon name="chevron-forward-outline" size={16} tone="primary" />
    </Pressable>
  );
}
