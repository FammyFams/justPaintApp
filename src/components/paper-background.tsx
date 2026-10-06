import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, paperGrainOpacity } from '@/theme';

const grain = require('@/assets/images/paper-grain.png');

type PaperBackgroundProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// The page color with a faint paper grain, like the website's body background.
export function PaperBackground({ children, style }: PaperBackgroundProps) {
  return (
    <View style={[styles.page, style]}>
      <Image source={grain} resizeMode="repeat" style={styles.grain} aria-hidden />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  grain: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: paperGrainOpacity,
  },
});
