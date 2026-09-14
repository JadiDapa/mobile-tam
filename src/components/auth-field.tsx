import { forwardRef, useState } from 'react';
import { Pressable, View, type TextInput as RNTextInput, type TextInputProps } from 'react-native';

import { Icon, type IoniconsIconName } from '@/components/icon';
import { TextInput } from '@/components/ui/text';

/**
 * Icon-accented input for the (auth) screens only — kept separate from the
 * shared `FormInput`/`PasswordInput` (used across ~10 other forms) so this
 * redesign doesn't ripple into unrelated screens.
 */
export const AuthField = forwardRef<RNTextInput, TextInputProps & { icon: IoniconsIconName }>(
  function AuthField({ icon, ...props }, ref) {
    return (
      <View className="w-full flex-row items-center gap-2.5 rounded-2xl border border-border bg-muted px-4 py-3.5">
        <Icon name={icon} size={18} tone="muted" />
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-base text-text"
          {...props}
        />
      </View>
    );
  },
);

export function AuthPasswordField({
  icon = 'lock-closed-outline',
  ...props
}: TextInputProps & { icon?: IoniconsIconName }) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="w-full flex-row items-center gap-2.5 rounded-2xl border border-border bg-muted px-4 py-3.5">
      <Icon name={icon} size={18} tone="muted" />
      <TextInput
        secureTextEntry={!visible}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-base text-text"
        {...props}
      />
      <Pressable onPress={() => setVisible((prev) => !prev)} hitSlop={8}>
        <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} tone="muted" />
      </Pressable>
    </View>
  );
}
