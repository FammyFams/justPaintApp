import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import type { PickedPhoto } from '@/screens/post/pick-photo';
import { colors, radius, spacing } from '@/theme';

type PhotoBoxProps = {
  photo: PickedPhoto | null;
  // Opening or shrinking a photo.
  busy: boolean;
  onPick: (from: 'camera' | 'library') => void;
};

// The photo to post, or a dashed space for it, with the camera and the photo
// library underneath.
export function PhotoBox({ photo, busy, onPick }: PhotoBoxProps) {
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.box,
          photo ? [styles.filled, { aspectRatio: photo.width / photo.height }] : styles.empty,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="getting your photo ready" />
        ) : photo ? (
          <Image
            source={{ uri: photo.uri }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            accessibilityLabel="your photo"
          />
        ) : (
          <Text variant="subhead" style={styles.center}>
            a photo of your painting goes here
          </Text>
        )}
      </View>
      <View style={styles.buttons}>
        <Button
          title={photo ? 'take another' : 'take a photo'}
          onPress={() => onPick('camera')}
          disabled={busy}
          style={styles.button}
        />
        <Button
          title={photo ? 'choose another' : 'choose a photo'}
          onPress={() => onPick('library')}
          disabled={busy}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  box: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderColor: colors.input,
    borderWidth: 1,
    borderRadius: radius,
  },
  empty: {
    height: 200,
    borderStyle: 'dashed',
    padding: spacing.md,
  },
  // Set back explicitly: Android keeps a dashed edge otherwise.
  filled: {
    borderStyle: 'solid',
  },
  center: {
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
