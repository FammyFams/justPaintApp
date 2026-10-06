import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { PaperBackground } from '@/components/paper-background';
import { TagChip } from '@/components/tag-chip';
import { Text } from '@/components/text';
import { aspectRatios, usePainting } from '@/data/paintings';
import { artistHandle } from '@/lib/artist-url';
import { formatDate } from '@/lib/dates';
import { env } from '@/lib/env';
import { CommentList } from '@/screens/painting/comment-list';
import { ZoomableImage } from '@/screens/painting/zoomable-image';
import { colors, fonts, spacing, touchTarget } from '@/theme';

export function PaintingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const painting = usePainting(id);

  const share = () => {
    const url = `${env.siteUrl}/painting/${id}`;
    // iOS shares a url as a link; Android only takes text.
    Share.share(Platform.OS === 'ios' ? { url } : { message: url });
  };

  return (
    <PaperBackground>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={share}
              accessibilityRole="button"
              accessibilityLabel="share"
              hitSlop={8}
              style={styles.headerButton}
            >
              <SymbolView
                name={{ ios: 'square.and.arrow.up', android: 'share' }}
                tintColor={colors.foreground}
                size={22}
              />
            </Pressable>
          ),
        }}
      />

      {painting.data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <ZoomableImage
            uri={painting.data.imageUrl}
            initialAspectRatio={aspectRatios[painting.data.aspect]}
            label={painting.data.title}
          />
          <View style={styles.details}>
            <View style={styles.titleBlock}>
              <Text variant="title" accessibilityRole="header">
                {painting.data.title}
              </Text>
              {painting.data.artistId ? (
                <Link
                  href={{
                    pathname: '/artist/[name]',
                    params: {
                      name: artistHandle({
                        id: painting.data.artistId,
                        displayName: painting.data.authorName,
                      }),
                    },
                  }}
                  asChild
                >
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`by ${painting.data.authorName}`}
                    style={({ pressed }) => [styles.artistLink, pressed && styles.pressed]}
                  >
                    <Text variant="subhead">
                      by{' '}
                      <Text variant="subhead" tone="primary" style={styles.artistName}>
                        {painting.data.authorName}
                      </Text>
                    </Text>
                  </Pressable>
                </Link>
              ) : (
                <Text variant="subhead">
                  by{' '}
                  <Text variant="subhead" tone="default">
                    {painting.data.authorName}
                  </Text>
                  {' · guest'}
                </Text>
              )}
              <Text variant="caption">{formatDate(painting.data.createdAt)}</Text>
            </View>

            {/* A10 turns this into the heart button. */}
            <View
              style={styles.hearts}
              accessible
              accessibilityLabel={`${painting.data.heartCount} ${painting.data.heartCount === 1 ? 'heart' : 'hearts'}`}
            >
              <SymbolView
                name={{ ios: 'heart.fill', android: 'favorite' }}
                tintColor={colors.primary}
                size={18}
              />
              <Text variant="subhead" tone="default">
                {painting.data.heartCount} {painting.data.heartCount === 1 ? 'heart' : 'hearts'}
              </Text>
            </View>

            {painting.data.description ? <Text>{painting.data.description}</Text> : null}

            {painting.data.tags.length > 0 && (
              <View style={styles.tags}>
                {painting.data.tags.map((tag) => (
                  <TagChip key={tag.id} name={tag.name} />
                ))}
              </View>
            )}

            <CommentList paintingId={id} />
          </View>
        </ScrollView>
      ) : painting.isPending ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading painting" />
        </View>
      ) : painting.isError ? (
        <View style={styles.state}>
          <Text variant="headline">couldn&apos;t load this painting</Text>
          <Text variant="subhead">the server may be busy. check your connection and try again.</Text>
          <Button title="try again" onPress={() => painting.refetch()} />
        </View>
      ) : (
        <View style={styles.state}>
          <Text variant="prompt" tone="muted">
            this painting isn&apos;t here anymore
          </Text>
          <Button title="back" onPress={() => router.back()} />
        </View>
      )}
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  details: {
    gap: spacing.md,
    padding: spacing.md,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  artistLink: {
    alignSelf: 'flex-start',
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  artistName: {
    fontFamily: fonts.semibold,
  },
  pressed: {
    opacity: 0.6,
  },
  hearts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
});
