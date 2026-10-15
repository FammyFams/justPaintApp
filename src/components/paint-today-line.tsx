import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { TodayMark } from '@/components/today-mark';

const LINE = 'what did you paint today?';

// The tagline under JUST PAINT and Post, with "today" marked. Read out as one
// sentence; wraps in pieces when large text makes it too wide.
export function PaintTodayLine({ center = false }: { center?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={LINE}
      style={[styles.line, center && styles.center]}
    >
      <Text tone="muted">what did you paint </Text>
      <TodayMark tone="muted" />
      <Text tone="muted">?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  center: {
    justifyContent: 'center',
  },
});
