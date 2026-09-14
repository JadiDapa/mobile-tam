import { useState } from 'react';
import { Pressable, View, type TextInputProps } from 'react-native';
import { TextInput } from '@/components/ui/text';

import { Icon } from '@/components/icon';

export function PasswordInput(props: TextInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="w-full flex-row items-center rounded-xl bg-muted pr-4">
      <TextInput
        placeholderTextColor="#9CA3AF"
        secureTextEntry={!visible}
        className="flex-1 px-4 py-3 text-text"
        {...props}
      />
      <Pressable onPress={() => setVisible((prev) => !prev)} hitSlop={8}>
        <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} tone="muted" />
      </Pressable>
    </View>
  );
}
