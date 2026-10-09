import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BlockedNotice } from '@/components/blocked-notice';
import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { ReportBlockMenu } from '@/components/report-block-menu';
import { Text } from '@/components/text';
import { useArtist } from '@/data/artists';
import { useBlockedIds } from '@/data/blocks';
import { useArtistPaintings } from '@/data/paintings';
import { colors, spacing } from '@/theme';

const joinedFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export function ArtistScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const artist = useArtist(name);
  const paintings = useArtistPaintings(artist.data?.id);
  const blocked = useBlockedIds();
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
              <Text variant="headline">Couldn&apos;t load this artist</Text>
              <Text variant="subhead">The server may be busy. Check your connection and try again.</Text>
              <Button title="Try again" onPress={() => artist.refetch()} />
            </>
          ) : (
            <>
              <Text variant="prompt" tone="muted">
                No artist called {name}
              </Text>
              <Button title="Back" onPress={() => router.back()} />
            </>
          )}
        </View>
      </PaperBackground>
    );
  }

  // Artists are blocked here; they're reported through one of their paintings.
  const target = { id: artist.data.id, name: artist.data.displayName };
  const menu = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <ReportBlockMenu label={`More options for ${target.name}`} artist={target} />
        ),
      }}
    />
  );
  if (blocked.has(target.id)) {
    return (
      <PaperBackground>
        {menu}
        <BlockedNotice artist={target} />
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
        Joined {joinedFormat.format(new Date(artist.data.joinedAt))}
        {count !== undefined && ` · ${count} ${count === 1 ? 'painting' : 'paintings'}`}
      </Text>
      {artist.data.bio ? <Text style={styles.bio}>{artist.data.bio}</Text> : null}
      {(artist.isRefetchError || paintings.isRefetchError) && (
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
      <Text variant="subhead">No paintings yet.</Text>
    </View>
  );

  return (
    <PaperBackground>
      {menu}
      <PaintingGrid
        paintings={paintings.data ?? []}
        columns={2}
        showArtist={false}
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
