import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icon';
import { NotificationBadge } from '@/components/notification-badge';
import { usePendingReviewCount } from '@/lib/queries';

export function NotificationButton() {
  const pendingCount = usePendingReviewCount();

  return (
    <Link href="/notifications" asChild>
      <Pressable hitSlop={8}>
        <View>
          <Icon name="notifications-outline" size={24} />
          <NotificationBadge count={pendingCount} />
        </View>
      </Pressable>
    </Link>
  );
}
