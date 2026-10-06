import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { useChallenge } from '@/data/challenge';
import { paintingsOf, useChallengeEntries } from '@/data/paintings';
import { DayHeading } from '@/screens/challenge/day-heading';
import { TodayCard } from '@/screens/challenge/today-card';
import { colors, spacing } from '@/theme';

// Prompt dates are plain calendar days, so format them in UTC to keep the day.
const dayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});
const formatDay = (date: string) => dayFormat.format(new Date(date)).toLowerCase();

export function ChallengeScreen() {
  const challenge = useChallenge();
  const entries = useChallengeEntries();
  const [refreshing, setRefreshing] = useState(false);
  const paintings = paintingsOf(entries.data);
  const prompts = challenge.data?.prompts;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([entries.refresh(), challenge.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = () => {
    if (entries.hasNextPage && !entries.isFetchingNextPage && !entries.isFetchNextPageError) {
      entries.fetchNextPage();
    }
  };

  const header = (
    <View style={styles.header}>
      <Text variant="display" accessibilityRole="header">
        {challenge.data?.name ?? 'october painting challenge'}
      </Text>
      <Text tone="muted">one prompt a day, all month long. paint along with everyone.</Text>
      <View style={styles.today}>
        {challenge.data ? (
          <TodayCard challenge={challenge.data} startLabel={formatDay(challenge.data.startDate)} />
        ) : challenge.isPending ? (
          <ActivityIndicator
            color={colors.mutedForeground}
            accessibilityLabel="loading today's prompt"
            style={styles.start}
          />
        ) : (
          <View style={styles.inline}>
            <Text variant="subhead">couldn&apos;t load today&apos;s prompt.</Text>
            <Button title="try again" onPress={() => challenge.refetch()} />
          </View>
        )}
      </View>
    </View>
  );

  // Only shown while there are no entries.
  const empty = entries.isPending ? (
    <View style={styles.state}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading entries" />
    </View>
  ) : entries.isError ? (
    <View style={styles.state}>
      <Text variant="headline">couldn&apos;t load the entries</Text>
      <Text variant="subhead" style={styles.center}>
        the server may be busy. check your connection and try again.
      </Text>
      <Button title="try again" onPress={() => entries.refetch()} />
    </View>
  ) : (
    <View style={styles.state}>
      <Text variant="prompt" tone="muted">
        no entries yet
      </Text>
      <Text variant="subhead">be the first to post one.</Text>
    </View>
  );

  const footer = entries.isFetchNextPageError ? (
    <View style={styles.state}>
      <Text variant="subhead">couldn&apos;t load more entries.</Text>
      <Button title="try again" onPress={() => entries.fetchNextPage()} />
    </View>
  ) : entries.isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading more entries" />
    </View>
  ) : null;

  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <PaintingGrid
          paintings={paintings}
          columns={1}
          sectionOf={(painting) => painting.octoberDay}
          renderSection={(day) =>
            typeof day === 'number' ? (
              <DayHeading
                date={prompts?.[day - 1] ? formatDay(prompts[day - 1].date) : `october ${day}`}
                prompt={prompts?.[day - 1]?.prompt}
              />
            ) : (
              <DayHeading date="other entries" />
            )
          }
          header={header}
          empty={empty}
          footer={footer}
          onEndReached={onEndReached}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
  },
  today: {
    paddingTop: spacing.md,
  },
  start: {
    alignSelf: 'flex-start',
  },
  inline: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
