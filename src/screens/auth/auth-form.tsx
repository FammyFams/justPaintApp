import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { spacing } from '@/theme';

type AuthFormProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

// The sign-in, sign-up and forgot-password screens: a heading like the
// website's, then the form. On iOS the scroll view makes room for the keyboard
// itself; Android resizes the window.
export function AuthForm({ title, intro, children }: AuthFormProps) {
  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.heading}>
          <Text variant="display" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="subhead">{intro}</Text>
        </View>
        {children}
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
});
