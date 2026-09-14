import { forwardRef } from 'react';
import { type TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { TextInput } from '@/components/ui/text';

export const FormInput = forwardRef<RNTextInput, TextInputProps>(function FormInput(props, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#9CA3AF"
      className="w-full rounded-xl bg-muted px-4 py-3 text-text"
      {...props}
    />
  );
});
