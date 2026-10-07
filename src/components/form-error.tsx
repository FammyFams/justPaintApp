import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { colors, spacing } from '@/theme';

// Why a form didn't go through. The red is only on the icon: it's too light
// for small text (theme.ts), so the words stay navy.
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <View style={styles.row} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <SymbolView
        name={{ ios: 'exclamationmark.circle.fill', android: 'error' }}
        tintColor={colors.error}
        size={18}
        style={styles.icon}
      />
      <Text variant="subhead" tone="default" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
  },
});
