import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { challengeToday, type Challenge } from '@/data/challenge';
import { fonts, spacing } from '@/theme';

type TodayCardProps = {
  challenge: Challenge;
  startLabel: string;
  // Shown at the bottom right (the show calendar button).
  action?: ReactNode;
};

// Today's prompt, or a note before or after the challenge. Posting is the Post
// tab's job, so there's no post button here.
export function TodayCard({ challenge, startLabel, action }: TodayCardProps) {
  const today = challengeToday(challenge);

  return (
    <View style={styles.card}>
      {today.phase === 'before' ? (
        <>
          <Text variant="headline">the challenge starts {startLabel}.</Text>
          <Text variant="subhead">come back then for the first prompt.</Text>
        </>
      ) : today.phase === 'after' ? (
        <>
          <Text variant="headline">the challenge has ended.</Text>
          <Text variant="subhead">thanks for painting along. every entry is below.</Text>
        </>
      ) : (
        <>
          <Text variant="caption" tone="primary" style={styles.label}>
            TODAY&apos;S PROMPT, DAY {today.prompt.day}
          </Text>
          <Text variant="prompt">{today.prompt.prompt}</Text>
        </>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  // On the page itself, no box (2026-10-07).
  card: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.semibold,
    letterSpacing: 1.5,
  },
  action: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
});
