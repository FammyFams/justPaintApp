import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { AccessibilityInfo, Alert, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { errorMessage, useSetAvatar, type Me } from '@/data/account';
import { spacing } from '@/theme';

// The website keeps a 256 px square, so 512 is plenty and uploads quickly.
const SIDE = 512;

// A square from the photo library (the system picker, no permission needed),
// cropped by them, then shrunk to JPEG (iPhone HEIC included). Null when they
// back out.
async function pickSquare(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.min(asset.width, asset.height) > SIDE) {
    context.resize(asset.width <= asset.height ? { width: SIDE } : { height: SIDE });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return saved.uri;
}

// Your picture at the top of Settings, with change and remove.
export function AvatarPicker({ me }: { me: Me }) {
  const avatar = useSetAvatar();
  const [pickError, setPickError] = useState<string | null>(null);

  const change = async () => {
    avatar.reset();
    setPickError(null);
    let uri: string | null;
    try {
      uri = await pickSquare();
    } catch {
      setPickError("couldn't open that photo. try a different one.");
      return;
    }
    if (uri) {
      avatar.mutate(uri, {
        onSuccess: () => AccessibilityInfo.announceForAccessibility('picture changed'),
      });
    }
  };

  const remove = () =>
    Alert.alert('remove your picture?', 'your initials show instead.', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'remove',
        style: 'destructive',
        onPress: () =>
          avatar.mutate(null, {
            onSuccess: () => AccessibilityInfo.announceForAccessibility('picture removed'),
          }),
      },
    ]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Avatar name={me.displayName ?? 'you'} url={me.avatarUrl} />
        <View style={styles.actions}>
          <Button
            title="change picture"
            onPress={change}
            loading={avatar.isPending && avatar.variables !== null}
            disabled={avatar.isPending}
          />
          {me.avatarUrl ? (
            <Button
              title="remove picture"
              onPress={remove}
              loading={avatar.isPending && avatar.variables === null}
              disabled={avatar.isPending}
            />
          ) : null}
        </View>
      </View>
      <FormError message={pickError ?? (avatar.isError ? errorMessage(avatar.error) : null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actions: {
    alignItems: 'flex-start',
  },
});
