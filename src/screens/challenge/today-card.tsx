import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { challengeToday, type Challenge } from '@/data/challenge';
import { colors, fonts, radius, spacing } from '@/theme';

// Today's prompt with the hand-circled "post yours", or a note before or after
// the challenge.
export function TodayCard({ challenge, startLabel }: { challenge: Challenge; startLabel: string }) {
  const today = challengeToday(challenge);

  if (today.phase === 'before') {
    return (
      <View style={styles.card}>
        <Text variant="headline">the challenge starts {startLabel}.</Text>
        <Text variant="subhead">come back then for the first prompt.</Text>
      </View>
    );
  }

  if (today.phase === 'after') {
    return (
      <View style={styles.card}>
        <Text variant="headline">the challenge has ended.</Text>
        <Text variant="subhead">thanks for painting along. every entry is below.</Text>
      </View>
    );
  }

  const { day, prompt } = today.prompt;
  return (
    <View style={styles.card}>
      <Text variant="caption" tone="primary" style={styles.label}>
        TODAY&apos;S PROMPT, DAY {day}
      </Text>
      <Text variant="prompt">{prompt}</Text>
      <Button
        title="post yours"
        variant="circled"
        // A12's Post screen ticks the challenge and this day when it sees the param.
        onPress={() => router.navigate({ pathname: '/post', params: { challengeDay: String(day) } })}
        style={styles.post}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius,
    padding: spacing.md,
  },
  label: {
    fontFamily: fonts.semibold,
    letterSpacing: 1.5,
  },
  post: {
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
});
