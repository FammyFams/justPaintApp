import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HeartButton } from '@/components/heart-button';
import { TagChip } from '@/components/tag-chip';
import { Text } from '@/components/text';
import { aspectRatios, type Painting } from '@/data/paintings';
import { colors, radius, spacing, touchTarget } from '@/theme';

export function PaintingCard({ painting }: { painting: Painting }) {
  const guest = !painting.artistId;
  const tags = painting.tags.slice(0, 3);
  return (
    <View style={styles.card}>
      <Link href={{ pathname: '/painting/[id]', params: { id: painting.id } }} asChild>
        <Pressable
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          accessibilityRole="link"
          accessibilityLabel={[
            painting.title,
            `by ${painting.authorName}${guest ? ', guest' : ''}`,
            ...tags.map((tag) => tag.name),
          ].join(', ')}
        >
          <Image
            source={{ uri: painting.imageUrl }}
            // Cards are recycled while scrolling; this stops an old painting showing.
            recyclingKey={painting.id}
            cachePolicy="disk"
            contentFit="cover"
            transition={150}
            // Fixed ratios, so cards keep their size while images load.
            style={[styles.image, { aspectRatio: aspectRatios[painting.aspect] }]}
          />
          <View style={styles.caption}>
            <Text variant="headline" numberOfLines={1}>
              {painting.title}
            </Text>
            <Text variant="caption" numberOfLines={1} style={styles.author}>
              {painting.authorName.toUpperCase()}
              {guest && ' · guest'}
            </Text>
            {tags.length > 0 && (
              <View style={styles.tags}>
                {tags.map((tag) => (
                  <TagChip key={tag.id} name={tag.name} />
                ))}
              </View>
            )}
          </View>
        </Pressable>
      </Link>
      {/* Beside the link, not inside it, so screen readers reach it on its own. */}
      <HeartButton painting={painting} compact style={styles.heart} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius,
    overflow: 'hidden',
  },
  link: {
    padding: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  image: {
    width: '100%',
    backgroundColor: colors.muted,
    // Nested inside the card's padding, so a little tighter than the card.
    borderRadius: radius / 2,
  },
  caption: {
    paddingTop: spacing.sm,
    paddingLeft: spacing.xs,
    // Room for the heart in the bottom corner.
    paddingRight: touchTarget,
    gap: 2,
  },
  author: {
    letterSpacing: 0.5,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  heart: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
  },
});
