import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { colors, fonts } from '@/theme';

// The website's three (lib/format.ts there), picked the same way, so a name gets
// the same color on both.
const palette = [
  { backgroundColor: colors.muted, color: colors.foreground },
  { backgroundColor: colors.accent, color: colors.accentForeground },
  { backgroundColor: colors.primary, color: colors.primaryForeground },
];

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

type AvatarProps = {
  name: string;
  // Already checked to be one of the website's files (/me checks it).
  url: string | null;
  size?: number;
};

// A profile picture (a 256px square, shown as is), or the name's initials.
// Decorative: the name is always written next to it.
export function Avatar({ name, url, size = 64 }: AvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        cachePolicy="disk"
        contentFit="cover"
        accessible={false}
        style={[styles.picture, shape]}
      />
    );
  }
  const { backgroundColor, color } = paletteFor(name);
  return (
    <View style={[styles.initials, shape, { backgroundColor }]} accessible={false}>
      <Text
        style={[styles.letters, { color, fontSize: size * 0.38, lineHeight: size * 0.5 }]}
        allowFontScaling={false}
        importantForAccessibility="no"
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  picture: {
    backgroundColor: colors.muted,
  },
  initials: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letters: {
    fontFamily: fonts.semibold,
  },
});
