import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { TextLink } from '@/components/text-link';
import { useMarkWelcomed } from '@/data/welcome';
import { spacing } from '@/theme';

const logo = require('@/assets/images/splash-icon.png');

// The first screen on a phone's first launch, while signed out. "continue as
// guest" or signing in closes it for good (the root layout decides). Creating an
// account or signing in opens over it, so closing those comes back here.
export function WelcomeScreen() {
  const markWelcomed = useMarkWelcomed();

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Image source={logo} contentFit="contain" style={styles.logo} accessible={false} />
          <Text variant="display" accessibilityRole="header" style={styles.center}>
            JUST PAINT
          </Text>
          <Text tone="muted" style={styles.center}>
            what did you paint today?
          </Text>
          <Text variant="subhead" style={styles.center}>
            a painting community for beginners.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            variant="circled"
            title="Create an account"
            onPress={() => router.push('/sign-up')}
            style={styles.centerSelf}
          />
          <Button title="Continue as guest" onPress={markWelcomed} />
          <View style={styles.signIn}>
            <Text variant="subhead">Already on justpaint.art?</Text>
            <TextLink title="Sign in" onPress={() => router.push('/sign-in')} />
          </View>
        </View>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  // Logo, words and buttons sit together in the middle of the screen.
  safe: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  // Words stretch to the full width and center their text: Android measures the
  // italic heading a little short, which cut "PAINT" off when it was sized to fit.
  top: {
    gap: spacing.xs,
  },
  logo: {
    alignSelf: 'center',
    width: 168,
    height: 168,
    marginBottom: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  centerSelf: {
    alignSelf: 'center',
  },
  signIn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
