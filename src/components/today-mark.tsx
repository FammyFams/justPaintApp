import { StyleSheet, View } from 'react-native';

import { Text, type TextProps } from '@/components/text';
import { colors } from '@/theme';

type TodayMarkProps = Omit<TextProps, 'children'> & { children?: string };

// "today" with a pale yellow marker swipe behind it, slightly tilted like a real
// highlighter (the website's TodayMark). justpaint is for what you painted
// today, so the word gets marked where the app says it. Sits in a row with the
// rest of its sentence, since a swipe can't go behind part of a Text.
export function TodayMark({ children = 'today', ...textProps }: TodayMarkProps) {
  return (
    <View>
      <View style={styles.swipe} />
      <Text {...textProps}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Lower part of the word, a little past each side, like the website.
  swipe: {
    position: 'absolute',
    left: -4,
    right: -4,
    top: '38%',
    bottom: '4%',
    borderRadius: 2,
    backgroundColor: colors.highlight,
    transform: [{ rotate: '-1deg' }],
  },
});
