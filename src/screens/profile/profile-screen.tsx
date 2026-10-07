import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { errorMessage, useMe, useSession, useSignOut } from '@/data/account';
import { SignedOutScreen } from '@/screens/signed-out/signed-out-screen';
import { colors, spacing } from '@/theme';

export function ProfileScreen() {
  const { signedIn, loading } = useSession();
  if (loading) return <PaperBackground />;
  if (!signedIn) {
    return (
      <SignedOutScreen title="profile" note="your paintings, your name and your bio, all in one place." />
    );
  }
  return <SignedInProfile />;
}

// Who's signed in, and log out. A14 builds the full profile and settings.
function SignedInProfile() {
  const { session } = useSession();
  const me = useMe();
  const signOut = useSignOut();

  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.content}>
          <Text variant="caption">signed in as</Text>
          {me.data ? (
            <Text variant="title" accessibilityRole="header">
              {me.data.displayName ?? 'you'}
            </Text>
          ) : me.isError ? (
            <FormError message={errorMessage(me.error)} />
          ) : (
            <ActivityIndicator
              color={colors.mutedForeground}
              accessibilityLabel="loading your profile"
              style={styles.spinner}
            />
          )}
          <Text variant="subhead">{session?.user.email}</Text>
          <Text variant="subhead" style={styles.soon}>
            your profile and settings are coming soon.
          </Text>
          <Button
            title="log out"
            loading={signOut.isPending}
            onPress={() => signOut.mutate()}
            style={styles.logOut}
          />
        </View>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: spacing.xs,
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  spinner: {
    alignSelf: 'flex-start',
  },
  soon: {
    marginTop: spacing.md,
  },
  logOut: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
});
