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
import { colors, fonts, spacing, touchTarget } from '@/theme';

type ButtonProps = {
  title: string;
  // plain: crimson words, for ordinary actions. circled: the main call to
  // action, circled by hand in crimson. Use one circled button per screen at most.
  variant?: 'plain' | 'circled';
  // Plain buttons only: navy words instead of crimson (log out).
  tone?: 'primary' | 'default';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'plain',
  tone = 'primary',
  onPress,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;
  const plain = variant === 'plain';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      // Plain words have no padding, so the touch area reaches past them.
      hitSlop={plain ? spacing.sm : undefined}
      style={({ pressed }) => [
        styles.base,
        plain ? styles.plain : styles.circled,
        plain && pressed && styles.plainPressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {!plain && <HandCircle tilted={pressed} />}
          {/* Keeps the button's width while the spinner shows. */}
          <View style={loading && styles.hidden}>
            {plain ? (
              <Text variant="subhead" tone={tone} style={styles.plainText}>
                {title}
              </Text>
            ) : (
              <Text variant="headline">{title}</Text>
            )}
          </View>
          {loading && (
            <ActivityIndicator
              color={plain && tone === 'primary' ? colors.primary : colors.foreground}
              style={styles.spinner}
            />
          )}
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
  },
  plain: {
    paddingVertical: spacing.sm,
  },
  plainPressed: {
    opacity: 0.6,
  },
  plainText: {
    fontFamily: fonts.semibold,
  },
  circled: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
