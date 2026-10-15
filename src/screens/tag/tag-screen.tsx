import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { paintingsOf, useTagPaintings, useTags } from '@/data/paintings';
import { colors, spacing } from '@/theme';

// Every painting with one tag, newest first (the website's /?tag=). Opened from
// the tags under a painting.
export function TagScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const tags = useTags();
  const paintings = useTagPaintings(slug);
  const [refreshing, setRefreshing] = useState(false);
  // Tags are plain lowercase text everywhere. The slug stands in until the
  // tag list loads (they only differ by dashes).
  const name = (tags.data?.find((tag) => tag.slug === slug)?.name ?? slug.replace(/-/g, ' '))
    .toLowerCase();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await paintings.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = () => {
    if (paintings.hasNextPage && !paintings.isFetchingNextPage && !paintings.isFetchNextPageError) {
      paintings.fetchNextPage();
    }
  };

  const header = (
    <View style={styles.header}>
      <Text variant="largeTitle" accessibilityRole="header">
        {name}
      </Text>
      <Text variant="subhead">Every painting tagged {name}, newest first.</Text>
      {paintings.isRefetchError && (
        <Text variant="caption">Couldn&apos;t refresh. Showing what you already have.</Text>
      )}
    </View>
  );

  const empty = paintings.isPending ? (
    <View style={styles.state}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading paintings" />
    </View>
  ) : paintings.isError ? (
    <View style={styles.state}>
      <Text variant="subhead">Couldn&apos;t load the paintings.</Text>
      <Button title="Try again" onPress={() => paintings.refetch()} />
    </View>
  ) : (
    <View style={styles.state}>
      <Text variant="subhead">No paintings with this tag yet.</Text>
    </View>
  );

  const footer = paintings.isFetchNextPageError ? (
    <View style={styles.state}>
      <Text variant="subhead">Couldn&apos;t load more paintings.</Text>
      <Button title="Try again" onPress={() => paintings.fetchNextPage()} />
    </View>
  ) : paintings.isFetchingNextPage ? (
    <View style={styles.footer}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading more paintings" />
    </View>
  ) : null;

  return (
    <PaperBackground>
      <PaintingGrid
        paintings={paintingsOf(paintings.data)}
        columns={2}
        header={header}
        empty={empty}
        footer={footer}
        onEndReached={onEndReached}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
