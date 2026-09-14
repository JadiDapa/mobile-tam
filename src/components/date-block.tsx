import { View } from 'react-native';
import { Text } from '@/components/ui/text';

const SHORT_DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function DateBlock({ iso, colorClassName }: { iso: string; colorClassName: string }) {
  const date = new Date(iso);

  return (
    <View
      className={`w-20 items-center justify-center gap-1 self-stretch rounded-2xl py-4 ${colorClassName}`}>
      <Text className="text-3xl font-bold text-white">{date.getDate()}</Text>
      <Text className="text-xs font-medium text-white/90">{SHORT_DAY_NAMES[date.getDay()]}</Text>
    </View>
  );
}
