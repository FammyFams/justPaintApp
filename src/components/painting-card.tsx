import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import type { Painting } from '@/data/paintings';
import { colors, radius, spacing } from '@/theme';

// Fixed ratios, so cards keep their size while images load.
const aspectRatio: Record<Painting['aspect'], number> = {
  portrait: 3 / 4,
  landscape: 4 / 3,
  square: 1,
};

export function PaintingCard({ painting }: { painting: Painting }) {
  const guest = !painting.artistId;
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${painting.title}, by ${painting.authorName}${guest ? ', guest' : ''}`}
    >
      <Image
        source={{ uri: painting.imageUrl }}
        // Cards are recycled while scrolling; this stops an old painting showing.
        recyclingKey={painting.id}
        cachePolicy="disk"
        contentFit="cover"
        transition={150}
        style={[styles.image, { aspectRatio: aspectRatio[painting.aspect] }]}
      />
      <View style={styles.caption}>
        <Text variant="headline" numberOfLines={1}>
          {painting.title}
        </Text>
        <Text variant="caption" numberOfLines={1} style={styles.author}>
          {painting.authorName.toUpperCase()}
          {guest && ' · guest'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius,
    padding: spacing.sm,
  },
  image: {
    width: '100%',
    backgroundColor: colors.muted,
    // Nested inside the card's padding, so a little tighter than the card.
    borderRadius: radius / 2,
  },
  caption: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  author: {
    letterSpacing: 0.5,
  },
});
