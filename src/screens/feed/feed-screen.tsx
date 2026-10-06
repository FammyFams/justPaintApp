import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { paintingsOf, useFeed } from '@/data/paintings';
import { colors, spacing } from '@/theme';

export function FeedScreen() {
  const feed = useFeed();
  const [refreshing, setRefreshing] = useState(false);
  const paintings = paintingsOf(feed.data);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await feed.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = () => {
    if (feed.hasNextPage && !feed.isFetchingNextPage && !feed.isFetchNextPageError) {
      feed.fetchNextPage();
    }
  };

  const header = (
    <View style={styles.header}>
      <Text variant="display" accessibilityRole="header">
        JUST PAINT
      </Text>
      <Text tone="muted">what did you paint today?</Text>
      <Text variant="subhead">a painting community for beginners.</Text>
      {feed.isRefetchError && (
        <Text variant="caption">couldn&apos;t refresh. showing the paintings you already have.</Text>
      )}
    </View>
  );

  // Only shown while there are no paintings.
  const empty = feed.isPending ? (
    <View style={styles.state}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading paintings" />
    </View>
  ) : feed.isError ? (
    <View style={styles.state}>
      <Text variant="headline">couldn&apos;t load the paintings</Text>
      <Text variant="subhead" style={styles.center}>
        the server may be busy. check your connection and try again.
      </Text>
      <Button title="try again" onPress={() => feed.refetch()} style={styles.retry} />
    </View>
  ) : (
    <View style={styles.state}>
      <Text variant="prompt" tone="muted">
        nothing here yet
      </Text>
      <Text variant="subhead">check back soon.</Text>
    </View>
  );

  const footer = feed.isFetchNextPageError ? (
    <View style={styles.state}>
      <Text variant="subhead">couldn&apos;t load more paintings.</Text>
      <Button title="try again" onPress={() => feed.fetchNextPage()} />
    </View>
  ) : feed.isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading more paintings" />
    </View>
  ) : null;

  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <PaintingGrid
          paintings={paintings}
          columns={1}
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
    paddingBottom: spacing.md,
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
  retry: {
    marginTop: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
