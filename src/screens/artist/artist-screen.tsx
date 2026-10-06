import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { useArtist } from '@/data/artists';
import { useArtistPaintings } from '@/data/paintings';
import { colors, spacing } from '@/theme';

const joinedFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export function ArtistScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const artist = useArtist(name);
  const paintings = useArtistPaintings(artist.data?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([artist.refetch(), paintings.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  if (!artist.data) {
    return (
      <PaperBackground>
        <View style={styles.state}>
          {artist.isPending ? (
            <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading artist" />
          ) : artist.isError ? (
            <>
              <Text variant="headline">couldn&apos;t load this artist</Text>
              <Text variant="subhead">the server may be busy. check your connection and try again.</Text>
              <Button title="try again" onPress={() => artist.refetch()} />
            </>
          ) : (
            <>
              <Text variant="prompt" tone="muted">
                no artist called {name}
              </Text>
              <Button title="back" onPress={() => router.back()} />
            </>
          )}
        </View>
      </PaperBackground>
    );
  }

  const count = paintings.data?.length;
  const header = (
    <View style={styles.header}>
      <Text variant="largeTitle" accessibilityRole="header">
        {artist.data.displayName}
      </Text>
      <Text variant="subhead">
        joined {joinedFormat.format(new Date(artist.data.joinedAt)).toLowerCase()}
        {count !== undefined && ` · ${count} ${count === 1 ? 'painting' : 'paintings'}`}
      </Text>
      {artist.data.bio ? <Text style={styles.bio}>{artist.data.bio}</Text> : null}
    </View>
  );

  const empty = paintings.isPending ? (
    <View style={styles.state}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading paintings" />
    </View>
  ) : paintings.isError ? (
    <View style={styles.state}>
      <Text variant="subhead">couldn&apos;t load the paintings.</Text>
      <Button title="try again" onPress={() => paintings.refetch()} />
    </View>
  ) : (
    <View style={styles.state}>
      <Text variant="subhead">no paintings yet.</Text>
    </View>
  );

  return (
    <PaperBackground>
      <PaintingGrid
        paintings={paintings.data ?? []}
        columns={2}
        header={header}
        empty={empty}
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
  bio: {
    paddingTop: spacing.sm,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
});
