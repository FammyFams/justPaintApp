import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { ZoomableImage } from '@/components/zoomable-image';
import { challengeToday, useChallenge, type Challenge } from '@/data/challenge';
import { paintingsOf, useChallengeEntries } from '@/data/paintings';
import { DayHeading } from '@/screens/challenge/day-heading';
import { ShareCalendarButton } from '@/screens/challenge/share-calendar-button';
import { TodayCard } from '@/screens/challenge/today-card';
import { colors, spacing } from '@/theme';

// Prompt dates are plain calendar days, so format them in UTC to keep the day.
const dayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});
const formatDay = (date: string) => dayFormat.format(new Date(date));

// The picture's text, for screen readers.
function calendarLabel(challenge: Challenge): string {
  const days = challenge.prompts.map((p) => `${formatDay(p.date)}, ${p.prompt ?? 'coming soon'}`);
  return `${challenge.name} calendar. ${days.join('. ')}`;
}

export function ChallengeScreen() {
  const challenge = useChallenge();
  const entries = useChallengeEntries(challenge.data?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const paintings = paintingsOf(entries.data);
  const prompts = challenge.data?.prompts;
  const today = challenge.data && challengeToday(challenge.data);

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
        {challenge.data?.name ?? 'Painting challenge'}
      </Text>
      <Text tone="muted">One prompt a day, all month long. Paint along with everyone.</Text>
      {(entries.isRefetchError || challenge.isRefetchError) && (
        <Text variant="caption">Couldn&apos;t refresh. Showing the entries you already have.</Text>
      )}
      <View style={styles.today}>
        {challenge.data ? (
          <>
            <TodayCard
              challenge={challenge.data}
              startLabel={formatDay(challenge.data.startDate)}
              action={
                <View style={styles.calendarActions}>
                  {showCalendar && (
                    <ShareCalendarButton challenge={challenge.data} />
                  )}
                  <Button
                    title={showCalendar ? 'Hide calendar' : 'Show calendar'}
                    onPress={() => setShowCalendar((shown) => !shown)}
                  />
                </View>
              }
            />
            {showCalendar && (
              <View style={styles.calendar}>
                <ZoomableImage
                  // The website's calendar picture, a static file on Vercel's CDN. Kept in
                  // the disk cache; its address changes with the prompts.
                  uri={challenge.data.calendarUrl}
                  initialAspectRatio={1080 / 1350}
                  label={calendarLabel(challenge.data)}
                />
                <Text variant="caption" style={styles.center}>
                  Pinch to zoom.
                </Text>
              </View>
            )}
          </>
        ) : challenge.isPending ? (
          <ActivityIndicator
            color={colors.mutedForeground}
            accessibilityLabel="loading today's prompt"
            style={styles.start}
          />
        ) : (
          <View style={styles.inline}>
            <Text variant="subhead">Couldn&apos;t load today&apos;s prompt.</Text>
            <Button title="Try again" onPress={() => challenge.refetch()} />
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
      <Text variant="headline">Couldn&apos;t load the entries</Text>
      <Text variant="subhead" style={styles.center}>
        The server may be busy. Check your connection and try again.
      </Text>
      <Button title="Try again" onPress={() => entries.refetch()} />
    </View>
  ) : (
    <View style={styles.state}>
      <Text variant="prompt" tone="muted">
        No entries yet
      </Text>
      <Text variant="subhead">Be the first to post one.</Text>
    </View>
  );

  const footer = entries.isFetchNextPageError ? (
    <View style={styles.state}>
      <Text variant="subhead">Couldn&apos;t load more entries.</Text>
      <Button title="Try again" onPress={() => entries.fetchNextPage()} />
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
          sectionOf={(painting) => painting.challengeDay}
          renderSection={(day) =>
            typeof day === 'number' ? (
              <DayHeading
                date={prompts?.[day - 1] ? formatDay(prompts[day - 1].date) : `Day ${day}`}
                prompt={prompts?.[day - 1]?.prompt ?? undefined}
              />
            ) : (
              <DayHeading date="Other entries" />
            )
          }
          // Today's prompt is already in the header, so its day heading waits for a scroll.
          headerSection={today?.phase === 'during' ? today.prompt.day : undefined}
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
  calendar: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  // Wraps onto two lines, still right-aligned, when large text makes them too wide.
  calendarActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
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
