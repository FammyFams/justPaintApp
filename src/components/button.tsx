import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { HandCircle } from '@/components/hand-circle';
import { Text } from '@/components/text';
import { colors, radius, spacing, touchTarget } from '@/theme';

type ButtonProps = {
  title: string;
  // plain: outlined, for ordinary actions. circled: the main call to action,
  // circled by hand in crimson. Use one circled button per screen at most.
  variant?: 'plain' | 'circled';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'plain',
  onPress,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'plain' && styles.plain,
        variant === 'plain' && pressed && styles.plainPressed,
        variant === 'circled' && styles.circled,
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {variant === 'circled' && <HandCircle tilted={pressed} />}
          {/* Keeps the button's width while the spinner shows. */}
          <View style={loading && styles.hidden}>
            <Text variant="headline">{title}</Text>
          </View>
          {loading && <ActivityIndicator color={colors.foreground} style={styles.spinner} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  plain: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
  },
  plainPressed: {
    backgroundColor: colors.muted,
  },
  circled: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  hidden: {
    opacity: 0,
  },
  spinner: {
    position: 'absolute',
  },
});
