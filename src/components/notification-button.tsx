import { Link } from 'expo-router';
import { Pressable } from 'react-native';

import { Icon } from '@/components/icon';

export function NotificationButton() {
  return (
    <Link href="/notifications" asChild>
      <Pressable hitSlop={8}>
        <Icon name="notifications-outline" size={24} />
      </Pressable>
    </Link>
  );
}
