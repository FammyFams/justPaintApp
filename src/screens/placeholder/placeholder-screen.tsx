import { StyleSheet, View } from 'react-native';

import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { spacing } from '@/theme';

// Stands in for a tab until its module builds the real screen.
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <PaperBackground>
      <View style={styles.center}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="subhead">coming soon</Text>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
});
