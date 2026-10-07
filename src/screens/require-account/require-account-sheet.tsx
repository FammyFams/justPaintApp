import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequireAccount } from '@/components/require-account';
import { colors, spacing } from '@/theme';

// The sheet a heart or a comment opens when signed out. Sized to its content.
export function RequireAccountSheet() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md }]}>
      <RequireAccount inSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
});
