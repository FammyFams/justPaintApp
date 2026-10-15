import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { spacing } from '@/theme';

const logo = require('@/assets/images/splash-icon.png');

// Same size as the native splash (app.json, expo-splash-screen imageWidth).
const LOGO_SIZE = 150;
// How long it stays once the app has started, then how long the fade takes.
const SHOW_MS = 1000;
const FADE_MS = 250;

// Reanimated CSS transition, like the heart button's.
const fade = {
  transitionProperty: 'opacity',
  transitionDuration: FADE_MS,
} as const;

// A short "JUST PAINT" screen each time the app starts from closed (it mounts
// once per start, so coming back from the background doesn't show it). The dog
// sits where the native splash draws it, centered, so the hand-off is still and
// only the name appears under it. Then it fades into the app.
export function LaunchScreen() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'shown' | 'fading' | 'gone'>('shown');

  useEffect(() => {
    const fadeAt = setTimeout(() => setPhase('fading'), SHOW_MS);
    const goneAt = setTimeout(() => setPhase('gone'), SHOW_MS + (reducedMotion ? 0 : FADE_MS));
    return () => {
      clearTimeout(fadeAt);
      clearTimeout(goneAt);
    };
  }, [reducedMotion]);

  if (phase === 'gone') return null;

  return (
    <Animated.View
      accessible
      accessibilityLabel="justPaint Art"
      pointerEvents={phase === 'fading' ? 'none' : 'auto'}
      style={[styles.cover, !reducedMotion && fade, phase === 'fading' && styles.faded]}
    >
      <PaperBackground>
        <View style={styles.center}>
          <Image source={logo} contentFit="contain" style={styles.logo} />
          <Text variant="display" style={styles.name}>
            JUST PAINT
          </Text>
        </View>
      </PaperBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFill,
    opacity: 1,
  },
  faded: {
    opacity: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  // Under the dog without moving it off center.
  name: {
    position: 'absolute',
    top: '50%',
    marginTop: LOGO_SIZE / 2 + spacing.md,
  },
});
