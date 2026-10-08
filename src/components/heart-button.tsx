import { useState } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { HeartIcon } from '@/components/heart-icon';
import { Text } from '@/components/text';
import { useHeart } from '@/data/hearts';
import type { Painting } from '@/data/paintings';
import { colors, spacing, touchTarget } from '@/theme';

// Reanimated CSS transition (StyleSheet.create doesn't take these): 150ms, ease-out.
const grow = {
  transform: [{ scale: 1 }],
  transitionProperty: 'transform',
  transitionDuration: 150,
  transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
} as const;

type HeartButtonProps = {
  painting: Painting;
  // Small, for cards. Otherwise bigger, with "12 hearts".
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HeartButton({ painting, compact, style }: HeartButtonProps) {
  const heart = useHeart(painting);
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const hearts = `${heart.count} ${heart.count === 1 ? 'heart' : 'hearts'}`;
  const size = compact ? 18 : 22;

  return (
    <Pressable
      onPress={heart.toggle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      pressRetentionOffset={16}
      // Always "heart" (on or off is its state), plus the count it shows.
      accessibilityRole="togglebutton"
      accessibilityLabel={`heart, ${hearts}`}
      accessibilityState={{ checked: heart.hearted, busy: heart.saving }}
      style={[
        compact ? styles.compact : styles.full,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* A small grow when hearted, like the website. Skipped with reduced motion. */}
      <Animated.View style={[grow, heart.hearted && !reducedMotion && styles.grown]}>
        <HeartIcon
          size={size}
          fill={heart.hearted ? colors.primary : undefined}
          stroke={heart.hearted ? colors.primary : colors.mutedForeground}
        />
      </Animated.View>
      <Text variant={compact ? 'caption' : 'subhead'} tone={heart.hearted ? 'default' : 'muted'}>
        {compact ? heart.count : hearts}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    minWidth: touchTarget,
    minHeight: touchTarget,
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  grown: {
    transform: [{ scale: 1.1 }],
  },
});
