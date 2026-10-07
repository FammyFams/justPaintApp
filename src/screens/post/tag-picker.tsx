import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { TAGS_MAX, useTags } from '@/data/paintings';
import { colors, fonts, radius, spacing, touchTarget } from '@/theme';

type TagPickerProps = {
  selected: string[];
  onChange: (tags: string[]) => void;
};

// The website's tags as chips to tick: at least one, at most five. A ticked
// chip gets a crimson edge and tick, not a crimson fill.
export function TagPicker({ selected, onChange }: TagPickerProps) {
  const tags = useTags();
  const full = selected.length >= TAGS_MAX;

  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((t) => t !== name) : [...selected, name]);

  return (
    <View style={styles.field}>
      <Text variant="subhead" tone="default" style={styles.label} accessibilityRole="header">
        tags
        <Text variant="subhead">{` · pick 1 to ${TAGS_MAX}`}</Text>
      </Text>
      {tags.data ? (
        <View style={styles.chips}>
          {tags.data.map((tag) => {
            const on = selected.includes(tag.name);
            const disabled = full && !on;
            return (
              <Pressable
                key={tag.id}
                accessibilityRole="checkbox"
                accessibilityLabel={tag.name}
                accessibilityState={{ checked: on, disabled }}
                disabled={disabled}
                onPress={() => toggle(tag.name)}
                style={({ pressed }) => [
                  styles.chip,
                  on && styles.on,
                  pressed && styles.pressed,
                  disabled && styles.disabled,
                ]}
              >
                {on && (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check' }}
                    tintColor={colors.primary}
                    size={14}
                  />
                )}
                <Text variant="subhead" tone="default">
                  {tag.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : tags.isPending ? (
        <ActivityIndicator color={colors.mutedForeground} accessibilityLabel="loading tags" style={styles.start} />
      ) : (
        <View style={styles.error}>
          <Text variant="subhead">couldn&apos;t load the tags.</Text>
          <Button title="try again" onPress={() => tags.refetch()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.semibold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.muted,
    borderColor: colors.muted,
    borderWidth: 1,
    borderRadius: radius,
  },
  on: {
    backgroundColor: colors.card,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  start: {
    alignSelf: 'flex-start',
  },
  error: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
});
