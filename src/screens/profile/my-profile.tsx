import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { PaintingGrid } from '@/components/painting-grid';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { errorMessage, useMe, useSession } from '@/data/account';
import { useArtistPaintings } from '@/data/paintings';
import { colors, spacing } from '@/theme';

const joinedFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

// The signed-in Profile tab: your page as others see it (the artist page, plus
// your picture), the way into settings (labelled edit profile), then everything
// you've posted.
export function MyProfile() {
  const { userId } = useSession();
  const me = useMe();
  const paintings = useArtistPaintings(userId ?? undefined);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([me.refetch(), paintings.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  if (!me.data) {
    return (
      <PaperBackground>
        <View style={styles.state}>
          {me.isError ? (
            <>
              <Text variant="headline">Couldn&apos;t load your profile</Text>
              <Text variant="subhead">{errorMessage(me.error)}</Text>
              <Button title="Try again" onPress={() => me.refetch()} />
            </>
          ) : (
            <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading your profile" />
          )}
        </View>
      </PaperBackground>
    );
  }

  const name = me.data.displayName ?? 'you';
  const count = paintings.data?.length;
  const facts = [
    me.data.joinedAt && `Joined ${joinedFormat.format(new Date(me.data.joinedAt))}`,
    count !== undefined && `${count} ${count === 1 ? 'painting' : 'paintings'}`,
  ].filter(Boolean);

  const header = (
    <View style={styles.header}>
      <View style={styles.identity}>
        <Avatar name={name} url={me.data.avatarUrl} />
        <View style={styles.nameColumn}>
          {/* Long names shrink to stay on the picture's line. */}
          <Text
            variant="largeTitle"
            accessibilityRole="header"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {name}
          </Text>
          <Button
            title="Edit profile"
            onPress={() => router.push('/settings')}
            style={styles.editProfile}
          />
        </View>
      </View>
      <Text variant="subhead">{facts.join(' · ')}</Text>
      {me.data.bio ? <Text style={styles.bio}>{me.data.bio}</Text> : null}
      {(me.isRefetchError || paintings.isRefetchError) && (
        <Text variant="caption">Couldn&apos;t refresh. Showing what you already have.</Text>
      )}
    </View>
  );

  const empty = paintings.isPending ? (
    <View style={styles.state}>
      <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading your paintings" />
    </View>
  ) : paintings.isError ? (
    <View style={styles.state}>
      <Text variant="subhead">Couldn&apos;t load your paintings.</Text>
      <Button title="Try again" onPress={() => paintings.refetch()} />
    </View>
  ) : (
    <View style={styles.state}>
      <Text variant="subhead">You haven&apos;t posted a painting yet.</Text>
      <Button title="Post a painting" onPress={() => router.navigate('/post')} />
    </View>
  );

  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <PaintingGrid
          paintings={paintings.data ?? []}
          columns={2}
          showArtist={false}
          header={header}
          empty={empty}
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  nameColumn: {
    flex: 1,
  },
  editProfile: {
    alignSelf: 'flex-start',
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
