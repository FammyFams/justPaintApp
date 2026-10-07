import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';
import { Text } from '@/components/text';
import { challengeToday, useChallenge } from '@/data/challenge';
import { colors, spacing, touchTarget } from '@/theme';

type ChallengeOptionProps = {
  // The challenge day the painting is for, or null when it isn't an entry.
  day: number | null;
  onChange: (day: number | null) => void;
};

// Only while the challenge is on. Ticking it picks today's prompt; the arrows
// move to another day, like the website's day list (any of the 31).
export function ChallengeOption({ day, onChange }: ChallengeOptionProps) {
  const challenge = useChallenge();
  if (!challenge.data) return null;
  const today = challengeToday(challenge.data);
  if (today.phase !== 'during') return null;

  const prompts = challenge.data.prompts;
  const chosen = prompts.find((prompt) => prompt.day === day);
  const first = prompts[0]?.day ?? 1;
  const last = prompts.at(-1)?.day ?? first;

  return (
    <View>
      <Checkbox
        label={`it's for the challenge (today's prompt: ${today.prompt.prompt.toLowerCase()})`}
        checked={day !== null}
        onChange={(checked) => onChange(checked ? today.prompt.day : null)}
      />
      {chosen && (
        <View style={styles.day}>
          <DayArrow
            direction="earlier"
            disabled={chosen.day <= first}
            onPress={() => onChange(chosen.day - 1)}
          />
          <Text
            variant="subhead"
            tone="default"
            style={styles.dayText}
            accessibilityLiveRegion="polite"
          >
            day {chosen.day}: {chosen.prompt.toLowerCase()}
            {chosen.day === today.prompt.day ? ' (today)' : ''}
          </Text>
          <DayArrow
            direction="later"
            disabled={chosen.day >= last}
            onPress={() => onChange(chosen.day + 1)}
          />
        </View>
      )}
    </View>
  );
}

function DayArrow({
  direction,
  disabled,
  onPress,
}: {
  direction: 'earlier' | 'later';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${direction} day`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, (pressed || disabled) && styles.dim]}
    >
      <SymbolView
        name={
          direction === 'earlier'
            ? { ios: 'chevron.left', android: 'chevron_left' }
            : { ios: 'chevron.right', android: 'chevron_right' }
        }
        tintColor={colors.foreground}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  day: {
    flexDirection: 'row',
    alignItems: 'center',
    // Tucked under the checkbox label (the arrow has its own 44pt of room).
    paddingLeft: spacing.sm,
  },
  dayText: {
    flexShrink: 1,
  },
  arrow: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    opacity: 0.4,
  },
});
