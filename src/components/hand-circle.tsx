import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, spacing } from '@/theme';

// The website's hand-drawn loop (app/october-challenge/page.tsx), with the
// overlapping tail. Stretches to fit whatever it is placed over.
const LOOP =
  'M30 8 C 70 0, 140 4, 152 20 C 160 36, 110 46, 70 44 C 25 42, 4 34, 8 22 C 12 10, 50 4, 95 6';

type HandCircleProps = {
  // Rotates the loop 2 degrees, like the website's hover tilt.
  tilted?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Place inside a relatively positioned parent; it overhangs the parent by 4pt.
export function HandCircle({ tilted, style }: HandCircleProps) {
  return (
    <View
      pointerEvents="none"
      aria-hidden
      style={[styles.overlay, tilted && styles.tilted, style]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 160 50" preserveAspectRatio="none">
        <Path
          d={LOOP}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: -spacing.xs,
    bottom: -spacing.xs,
    left: -spacing.xs,
    right: -spacing.xs,
  },
  tilted: {
    transform: [{ rotate: '-2deg' }],
  },
});
