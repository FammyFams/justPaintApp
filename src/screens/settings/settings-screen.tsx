import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { TextLink } from '@/components/text-link';
import { errorMessage, useMe, useSession } from '@/data/account';
import { env } from '@/lib/env';
import { AccountActions } from '@/screens/settings/account-actions';
import { ProfileForm } from '@/screens/settings/profile-form';
import { colors, spacing } from '@/theme';

// The address on the website's terms and privacy pages. W11 adds a support
// page (justpaint.art/support); this can open that instead once it's live.
const SUPPORT_EMAIL = 'thewcookie@gmail.com';

function emailSupport() {
  Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=justpaint%20app`).catch(() =>
    Alert.alert('email us', SUPPORT_EMAIL),
  );
}

// Pushed from the Profile tab, only while signed in.
export function SettingsScreen() {
  const { session } = useSession();
  const me = useMe();

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <Text variant="display" accessibilityRole="header">
          settings
        </Text>

        <Section title="your profile">
          {me.data ? (
            <ProfileForm me={me.data} />
          ) : me.isError ? (
            <View style={styles.state}>
              <Text variant="subhead">{errorMessage(me.error)}</Text>
              <Button title="try again" onPress={() => me.refetch()} style={styles.left} />
            </View>
          ) : (
            <ActivityIndicator
              color={colors.mutedForeground}
              accessibilityLabel="loading your profile"
              style={styles.left}
            />
          )}
        </Section>

        <Section title="about">
          <TextLink
            title="terms of use"
            role="link"
            onPress={() => WebBrowser.openBrowserAsync(`${env.siteUrl}/terms`)}
          />
          <TextLink
            title="privacy policy"
            role="link"
            onPress={() => WebBrowser.openBrowserAsync(`${env.siteUrl}/privacy`)}
          />
          <TextLink title="support" role="link" onPress={emailSupport} />
        </Section>

        <Section title="account">
          <Text variant="subhead">signed in as {session?.user.email}</Text>
          <TextLink title="blocked artists" role="link" onPress={() => router.push('/blocked')} />
          <AccountActions />
        </Section>
      </ScrollView>
    </PaperBackground>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  state: {
    gap: spacing.sm,
  },
  left: {
    alignSelf: 'flex-start',
  },
});
