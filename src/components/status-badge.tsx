import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { STATUS_DOT_CLASSES, STATUS_TEXT_CLASSES, type RequestStatus } from '@/constants/status';

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
      <Text className={`text-xs font-medium ${STATUS_TEXT_CLASSES[status]}`}>{status}</Text>
    </View>
  );
}
