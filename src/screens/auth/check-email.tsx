import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { colors, spacing } from '@/theme';

type CheckEmailProps = {
  message: string;
  action: ReactNode;
};

// After sign-up or a password reset request: the next step is in their inbox.
export function CheckEmail({ message, action }: CheckEmailProps) {
  return (
    <PaperBackground>
      <View style={styles.content} accessibilityLiveRegion="polite">
        <SymbolView
          name={{ ios: 'envelope.badge', android: 'mark_email_unread' }}
          tintColor={colors.primary}
          size={36}
        />
        <Text variant="title" accessibilityRole="header">
          check your email
        </Text>
        <Text variant="subhead" style={styles.center}>
          {message}
        </Text>
        <View style={styles.action}>{action}</View>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.xxl,
  },
  center: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
