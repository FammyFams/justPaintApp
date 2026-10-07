import { useRecyclingState } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { HeartBurst } from '@/components/heart-burst';
import { HeartButton } from '@/components/heart-button';
import { TagChip } from '@/components/tag-chip';
import { Text } from '@/components/text';
import { useHeart } from '@/data/hearts';
import { aspectRatios, type Painting } from '@/data/paintings';
import { colors, radius, spacing, touchTarget } from '@/theme';

// How long a first tap on the picture waits for a second one.
const DOUBLE_TAP_MS = 250;

export function PaintingCard({ painting }: { painting: Painting }) {
  const guest = !painting.artistId;
  const tags = painting.tags.slice(0, 3);
  const heart = useHeart(painting);
  const [pressed, setPressed] = useState(false);
  // Each double tap plays the big heart again. Starts over when the list
  // reuses this card for another painting.
  const [bursts, setBursts] = useRecyclingState(0, [painting.id]);

  const open = () => router.push({ pathname: '/painting/[id]', params: { id: painting.id } });

  // Like Instagram: two quick taps on the picture heart it (never un-heart),
  // one tap opens the painting.
  const pictureTaps = Gesture.Exclusive(
    Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(DOUBLE_TAP_MS)
      .runOnJS(true)
      .onStart(() => {
        if (heart.heart()) setBursts((n) => n + 1);
      }),
    Gesture.Tap().runOnJS(true).onStart(open),
  );

  return (
    <View style={[styles.card, pressed && styles.pressed]}>
      {/* One link for screen readers, which open it with their own double tap. */}
      <View
        accessible
        accessibilityRole="link"
        accessibilityLabel={[
          painting.title,
          `by ${painting.authorName}${guest ? ', guest' : ''}`,
          ...tags.map((tag) => tag.name),
        ].join(', ')}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(event) => event.nativeEvent.actionName === 'activate' && open()}
        style={styles.link}
      >
        <GestureDetector gesture={pictureTaps}>
          <View collapsable={false}>
            <Image
              source={{ uri: painting.cardImageUrl }}
              // Cards are recycled while scrolling; this stops an old painting showing.
              recyclingKey={painting.id}
              cachePolicy="disk"
              contentFit="cover"
              transition={150}
              // Fixed ratios, so cards keep their size while images load.
              style={[styles.image, { aspectRatio: aspectRatios[painting.aspect] }]}
            />
            {bursts > 0 && <HeartBurst key={bursts} />}
          </View>
        </GestureDetector>
        <Pressable
          accessible={false}
          onPress={open}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={styles.caption}
        >
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
        </Pressable>
      </View>
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
