import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { colors, radius, spacing, touchTarget } from '@/theme';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

// A square box with a crimson tick, and its label; the whole row is the target.
export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.box}>
        {checked && (
          <SymbolView
            name={{ ios: 'checkmark', android: 'check' }}
            tintColor={colors.primary}
            size={16}
          />
        )}
      </View>
      <Text variant="subhead" tone="default" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + spacing.xs,
    minHeight: touchTarget,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  box: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderColor: colors.input,
    borderWidth: 1,
    borderRadius: radius,
  },
  label: {
    flex: 1,
  },
});
