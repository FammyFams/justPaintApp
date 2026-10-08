import { useRecyclingState } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { HeartBurst } from '@/components/heart-burst';
import { HeartButton } from '@/components/heart-button';
import { Text } from '@/components/text';
import { useHeart } from '@/data/hearts';
import { aspectRatios, type Painting } from '@/data/paintings';
import { colors, radius, spacing, touchTarget } from '@/theme';

// How long a first tap on the picture waits for a second one.
const DOUBLE_TAP_MS = 250;

type PaintingCardProps = {
  painting: Painting;
  // Edge to edge, for one-column lists. Otherwise the picture keeps rounded
  // corners and the words line up with it (two-column walls).
  bleed?: boolean;
  // Off on an artist's own wall, where every painting is theirs.
  showArtist?: boolean;
};

export function PaintingCard({ painting, bleed, showArtist = true }: PaintingCardProps) {
  const guest = !painting.artistId;
  const tags = painting.tags.slice(0, 3);
  // "Dasha · watercolor, gouache": one plain line under the title.
  const details = [
    showArtist && `${painting.authorName}${guest ? ' (guest)' : ''}`,
    tags.map((tag) => tag.name.toLowerCase()).join(', '),
  ].filter(Boolean);
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
    <View>
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
              style={[
                styles.image,
                !bleed && styles.imageRounded,
                { aspectRatio: aspectRatios[painting.aspect] },
              ]}
            />
            {bursts > 0 && <HeartBurst key={bursts} />}
          </View>
        </GestureDetector>
        <Pressable
          accessible={false}
          onPress={open}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={[styles.caption, bleed && styles.captionInset, pressed && styles.pressed]}
        >
          <Text variant="headline" numberOfLines={1}>
            {painting.title}
          </Text>
          {details.length > 0 && (
            <Text variant="subhead" numberOfLines={1}>
              {details.join(' · ')}
            </Text>
          )}
        </Pressable>
      </View>
      {/* Beside the link, not inside it, so screen readers reach it on its own. */}
      <HeartButton painting={painting} compact style={[styles.heart, bleed && styles.heartInset]} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    backgroundColor: colors.muted,
  },
  imageRounded: {
    borderRadius: radius,
  },
  caption: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    // Room for the heart in the bottom corner.
    paddingRight: touchTarget,
    gap: 2,
  },
  captionInset: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md + touchTarget,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  // The heart pads its count by 4pt, so this lines the count up with the picture.
  heart: {
    position: 'absolute',
    right: -spacing.xs,
    bottom: 0,
  },
  heartInset: {
    right: spacing.md - spacing.xs,
  },
});
