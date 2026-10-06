import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { colors, fonts, spacing } from '@/theme';

// Above each day's entries, like the website: small crimson date, navy prompt, thin line.
export function DayHeading({ date, prompt }: { date: string; prompt?: string }) {
  return (
    <View
      style={styles.heading}
      accessible
      accessibilityRole="header"
      accessibilityLabel={prompt ? `${date}, ${prompt}` : date}
    >
      <Text variant="caption" tone="primary" style={styles.date}>
        {date.toUpperCase()}
      </Text>
      {prompt ? <Text variant="title">{prompt}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 2,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
  },
  date: {
    fontFamily: fonts.semibold,
    letterSpacing: 1.5,
  },
});
