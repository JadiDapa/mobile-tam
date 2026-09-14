import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

export function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            className={
              tab === active
                ? 'min-w-21 items-center justify-center rounded-full bg-primary px-4 py-2'
                : 'min-w-21 items-center justify-center rounded-full bg-muted px-4 py-2'
            }>
            <Text
              className={
                tab === active
                  ? 'text-sm font-medium text-primary-foreground'
                  : 'text-sm text-muted-foreground'
              }>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
