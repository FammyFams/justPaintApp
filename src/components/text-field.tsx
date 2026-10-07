import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/text';
import { colors, fonts, radius, spacing, touchTarget } from '@/theme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  // Shown after the label, muted ("at least 8 characters").
  hint?: string;
  ref?: Ref<TextInput>;
};

// A labelled text box like the website's: 3:1 edge, navy edge while typing.
export function TextField({ label, hint, onFocus, onBlur, ref, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text variant="subhead" tone="default" style={styles.label}>
        {label}
        {hint ? <Text variant="subhead">{` · ${hint}`}</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        accessibilityLabel={hint ? `${label}, ${hint}` : label}
        placeholderTextColor={colors.mutedForeground}
        selectionColor={colors.foreground}
        cursorColor={colors.foreground}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, focused && styles.focused]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.semibold,
  },
  input: {
    minHeight: touchTarget,
    backgroundColor: colors.card,
    borderColor: colors.input,
    borderWidth: 1,
    borderRadius: radius,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.foreground,
  },
  focused: {
    borderColor: colors.foreground,
  },
});
