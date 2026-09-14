import { forwardRef } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

/**
 * Nexa only ships static weight files (no variable font), so Android won't
 * synthesize bold/light from Nexa-Regular the way it does for system fonts.
 * Resolving `fontWeight` to the matching Nexa family here means every
 * existing `font-bold` / `fontWeight: 700` style (Tailwind or inline) keeps
 * working without touching each call site.
 */
function resolveNexaFamily(fontWeight: TextStyle['fontWeight']): string {
  const weight =
    fontWeight === 'bold' ? 700 : typeof fontWeight === 'string' ? Number(fontWeight) : fontWeight;

  if (typeof weight !== 'number' || Number.isNaN(weight)) return 'Nexa-Regular';
  if (weight >= 800) return 'Nexa-Black';
  if (weight >= 600) return 'Nexa-Bold';
  if (weight <= 300) return 'Nexa-Light';
  return 'Nexa-Regular';
}

function withNexaFont(style: TextProps['style']): TextProps['style'] {
  const flat = Array.isArray(style)
    ? Object.assign({}, ...(style as unknown[]).flat(Infinity))
    : (style ?? {});

  if (flat.fontFamily) return style;

  return [{ fontFamily: resolveNexaFamily(flat.fontWeight) }, style];
}

export const Text = forwardRef<RNText, TextProps>(({ style, ...props }, ref) => (
  <RNText ref={ref} style={withNexaFont(style)} {...props} />
));
Text.displayName = 'Text';

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({ style, ...props }, ref) => (
  <RNTextInput ref={ref} style={withNexaFont(style)} {...props} />
));
TextInput.displayName = 'TextInput';
