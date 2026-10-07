import { useState } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/text';
import { useHeart } from '@/data/hearts';
import type { Painting } from '@/data/paintings';
import { colors, radius, spacing, touchTarget } from '@/theme';

// The website's heart (lucide "heart", ISC license), so it can be filled on
// Android too, where the symbol font only has the outline.
const HEART =
  'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5';

// Reanimated CSS transition (StyleSheet.create doesn't take these): 150ms, ease-out.
const grow = {
  transform: [{ scale: 1 }],
  transitionProperty: 'transform',
  transitionDuration: 150,
  transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
} as const;

type HeartButtonProps = {
  painting: Painting;
  // Small and borderless, for cards. Otherwise an outlined button with "12 hearts".
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function HeartButton({ painting, compact, style }: HeartButtonProps) {
  const heart = useHeart(painting);
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const hearts = `${heart.count} ${heart.count === 1 ? 'heart' : 'hearts'}`;
  const size = compact ? 18 : 20;

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
        compact ? styles.compact : styles.outlined,
        pressed && (compact ? styles.compactPressed : styles.outlinedPressed),
        style,
      ]}
    >
      {/* A small grow when hearted, like the website. Skipped with reduced motion. */}
      <Animated.View style={[grow, heart.hearted && !reducedMotion && styles.grown]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d={HEART}
            fill={heart.hearted ? colors.primary : 'none'}
            stroke={heart.hearted ? colors.primary : colors.mutedForeground}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <Text variant={compact ? 'caption' : 'subhead'} tone={heart.hearted ? 'default' : 'muted'}>
        {compact ? heart.count : hearts}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outlined: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
  },
  outlinedPressed: {
    backgroundColor: colors.muted,
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
  compactPressed: {
    opacity: 0.6,
  },
  grown: {
    transform: [{ scale: 1.1 }],
  },
});
