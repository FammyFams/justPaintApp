import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { REPORT_REASONS, type ReportReason } from '@/data/reports';
import { colors, fonts, spacing, touchTarget } from '@/theme';

const reasons = Object.keys(REPORT_REASONS) as ReportReason[];

type ReasonPickerProps = {
  value: ReportReason | null;
  onChange: (reason: ReportReason) => void;
};

// The website's four reasons, one to pick: round boxes with a crimson dot.
export function ReasonPicker({ value, onChange }: ReasonPickerProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.group}>
      <Text variant="subhead" tone="default" style={styles.label}>
        what&apos;s wrong with it?
      </Text>
      {reasons.map((reason) => {
        const on = value === reason;
        return (
          <Pressable
            key={reason}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={REPORT_REASONS[reason]}
            onPress={() => onChange(reason)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={[styles.circle, on && styles.circleOn]}>
              {on && <View style={styles.dot} />}
            </View>
            <Text style={styles.text}>{REPORT_REASONS[reason]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  circleOn: {
    borderColor: colors.primary,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  text: {
    flex: 1,
  },
});
