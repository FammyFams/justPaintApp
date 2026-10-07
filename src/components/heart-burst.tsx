import { StyleSheet, View } from 'react-native';
import Animated, { css, cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { HeartIcon } from '@/components/heart-icon';
import { colors } from '@/theme';

// Pops in, settles, then fades: 700ms in all. Plays once when mounted.
const pop = css.keyframes({
  '0%': { opacity: 0, transform: [{ scale: 0.85 }] },
  '15%': { opacity: 1, transform: [{ scale: 1.1 }] },
  '30%': { opacity: 1, transform: [{ scale: 1 }] },
  '70%': { opacity: 1, transform: [{ scale: 1 }] },
  '100%': { opacity: 0, transform: [{ scale: 1 }] },
});

// With reduced motion: the same timing, no size change.
const fade = css.keyframes({
  '0%': { opacity: 0 },
  '15%': { opacity: 1 },
  '70%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const timing = {
  animationDuration: 700,
  animationFillMode: 'forwards',
  animationTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
} as const;

// The big heart over a picture when it's double-tapped. Give it a new key to
// play it again. Crimson with a cream edge, so it shows on light and dark
// paintings alike.
export function HeartBurst() {
  const reducedMotion = useReducedMotion();
  return (
    <View pointerEvents="none" aria-hidden style={styles.overlay}>
      <Animated.View style={[timing, { animationName: reducedMotion ? fade : pop }]}>
        <HeartIcon size={96} fill={colors.primary} stroke={colors.primaryForeground} strokeWidth={1.25} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
