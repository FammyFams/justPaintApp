import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, type } from '@/theme';

const tones = {
  default: colors.foreground,
  muted: colors.mutedForeground,
  primary: colors.primary,
} as const;

export type TextProps = RNTextProps & {
  variant?: keyof typeof type;
  // Overrides the variant's color.
  tone?: keyof typeof tones;
};

export function Text({ variant = 'body', tone, style, ...props }: TextProps) {
  return <RNText style={[type[variant], tone && { color: tones[tone] }, style]} {...props} />;
}
