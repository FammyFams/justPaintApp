import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaperBackground } from '@/components/paper-background';
import { RequireAccount } from '@/components/require-account';
import { Text } from '@/components/text';
import { colors, radius, spacing } from '@/theme';

type SignedOutScreenProps = {
  title: string;
  // What the tab is for, once signed in.
  note: string;
};

// A tab that needs an account (Post, Activity, Profile), while signed out.
export function SignedOutScreen({ title, note }: SignedOutScreenProps) {
  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <Text variant="display" accessibilityRole="header" style={styles.center}>
              {title}
            </Text>
            <Text tone="muted" style={styles.center}>
              {note}
            </Text>
          </View>
          <View style={styles.card}>
            <RequireAccount />
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.md,
  },
  heading: {
    gap: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius,
    padding: spacing.lg,
  },
});
