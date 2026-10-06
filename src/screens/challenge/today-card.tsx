import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { challengeToday, type Challenge } from '@/data/challenge';
import { colors, fonts, radius, spacing } from '@/theme';

type TodayCardProps = {
  challenge: Challenge;
  startLabel: string;
  // Sits beside "post yours" (the show calendar button).
  action?: ReactNode;
};

// Today's prompt with the hand-circled "post yours", or a note before or after
// the challenge.
export function TodayCard({ challenge, startLabel, action }: TodayCardProps) {
  const today = challengeToday(challenge);

  if (today.phase === 'before') {
    return (
      <View style={styles.card}>
        <Text variant="headline">the challenge starts {startLabel}.</Text>
        <Text variant="subhead">come back then for the first prompt.</Text>
        {action && <View style={styles.actions}>{action}</View>}
      </View>
    );
  }

  if (today.phase === 'after') {
    return (
      <View style={styles.card}>
        <Text variant="headline">the challenge has ended.</Text>
        <Text variant="subhead">thanks for painting along. every entry is below.</Text>
        {action && <View style={styles.actions}>{action}</View>}
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
      <View style={styles.actions}>
        <Button
          title="post yours"
          variant="circled"
          // A12's Post screen ticks the challenge and this day when it sees the param.
          onPress={() =>
            router.navigate({ pathname: '/post', params: { challengeDay: String(day) } })
          }
          style={styles.post}
        />
        {action}
      </View>
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
  // Wraps onto two lines when large text makes the buttons too wide.
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  // The hand circle overhangs the button by 4pt.
  post: {
    alignSelf: 'center',
    marginLeft: spacing.xs,
  },
});
