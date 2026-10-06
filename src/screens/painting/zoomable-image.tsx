import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors } from '@/theme';

const MAX_SCALE = 4;

type ZoomableImageProps = {
  uri: string;
  // Shape to hold while the image loads; replaced by the image's real shape.
  initialAspectRatio: number;
  label: string;
};

// Pinch to look closer, like Instagram: zooms around the fingers, follows them,
// and eases back when let go.
export function ZoomableImage({ uri, initialAspectRatio, label }: ZoomableImageProps) {
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      // Where the fingers started, from the image's center.
      startX.value = e.focalX - width.value / 2;
      startY.value = e.focalY - height.value / 2;
    })
    .onUpdate((e) => {
      const s = Math.min(Math.max(e.scale, 1), MAX_SCALE);
      scale.value = s;
      // Keep the point that was under the fingers under them.
      translateX.value = e.focalX - width.value / 2 - startX.value * s;
      translateY.value = e.focalY - height.value / 2 - startY.value * s;
    })
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 200 });
      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    });

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View
        style={[styles.frame, { aspectRatio }, zoomStyle]}
        onLayout={(e) => {
          width.value = e.nativeEvent.layout.width;
          height.value = e.nativeEvent.layout.height;
        }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
      >
        <Image
          source={{ uri }}
          cachePolicy="disk"
          contentFit="contain"
          transition={150}
          style={styles.image}
          onLoad={(e) => {
            if (e.source.width && e.source.height) setAspectRatio(e.source.width / e.source.height);
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    backgroundColor: colors.muted,
    // Draws over the text below it while zoomed.
    zIndex: 1,
  },
  image: {
    flex: 1,
  },
});
