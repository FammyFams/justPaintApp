import { StyleSheet } from 'react-native';

import { Text } from '@/components/text';
import { colors, radius, spacing } from '@/theme';

export function TagChip({ name }: { name: string }) {
  return (
    <Text variant="caption" tone="default" style={styles.chip}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.muted,
    borderRadius: radius,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
