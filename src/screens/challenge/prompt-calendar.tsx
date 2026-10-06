import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import type { Challenge } from '@/data/challenge';
import { colors, fonts, spacing, touchTarget } from '@/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Prompt dates are plain calendar days, so read and format them in UTC.
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

type PromptCalendarProps = {
  challenge: Challenge;
  // Today's day number, or null outside the challenge.
  today: number | null;
};

// The month of prompts, styled like the website's calendar: thick rules between
// weeks, hairlines between days, today in crimson, the last day (Halloween) in
// orange. Seven columns of prompt text don't fit a phone, so cells show the day
// and tapping one shows its prompt below.
export function PromptCalendar({ challenge, today }: PromptCalendarProps) {
  const { prompts } = challenge;
  const [selected, setSelected] = useState(today ?? 1);
  const firstWeekday = new Date(challenge.startDate).getUTCDay();

  // Blank cells before day 1, then the days, padded to whole weeks.
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...prompts.map((p) => p.day),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const chosen = prompts[selected - 1];

  return (
    <View style={styles.calendar}>
      <View style={styles.weekdays} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {WEEKDAYS.map((d, i) => (
          <Text key={i} variant="caption" tone="default" style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week, w) => (
        <View key={w} style={styles.week}>
          {week.map((day, i) => {
            if (day === null) return <View key={i} style={styles.cell} />;
            const prompt = prompts[day - 1];
            const isToday = day === today;
            const isLast = day === prompts.length;
            const isSelected = day === selected;
            return (
              <Pressable
                key={i}
                onPress={() => setSelected(day)}
                accessibilityRole="button"
                accessibilityLabel={`${WEEKDAY_NAMES[i]}, ${dayFormat.format(new Date(prompt.date)).toLowerCase()}, ${prompt.prompt}${isToday ? ', today' : ''}`}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.cell,
                  styles.day,
                  i > 0 && styles.hairline,
                  isLast && styles.last,
                  isToday && styles.today,
                  pressed && !isToday && styles.pressed,
                ]}
              >
                <Text
                  variant="headline"
                  style={[styles.number, isToday && styles.onToday]}
                >
                  {day}
                </Text>
                {isSelected && <View style={[styles.mark, isToday && styles.markOnToday]} />}
              </Pressable>
            );
          })}
        </View>
      ))}

      {chosen && (
        <View style={styles.chosen} accessibilityLiveRegion="polite">
          <Text variant="caption" tone="primary" style={styles.label}>
            {dayFormat.format(new Date(chosen.date)).toUpperCase()}
            {chosen.day === today ? ', TODAY' : ''}
          </Text>
          <Text variant="title">{chosen.prompt}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    paddingTop: spacing.md,
  },
  weekdays: {
    flexDirection: 'row',
    borderBottomColor: colors.foreground,
    borderBottomWidth: 3,
    paddingBottom: spacing.xs,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.extrabold,
  },
  week: {
    flexDirection: 'row',
    borderBottomColor: colors.foreground,
    borderBottomWidth: 2,
  },
  cell: {
    flex: 1,
    minHeight: touchTarget,
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  hairline: {
    borderLeftColor: colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  number: {
    fontFamily: fonts.extrabold,
    fontVariant: ['tabular-nums'],
  },
  // The website's Halloween square: orange, always with navy text.
  last: {
    backgroundColor: colors.accent,
  },
  today: {
    backgroundColor: colors.primary,
  },
  onToday: {
    color: colors.primaryForeground,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  // A short bar under the selected day's number.
  mark: {
    position: 'absolute',
    bottom: spacing.xs,
    width: spacing.md,
    height: 2,
    backgroundColor: colors.foreground,
  },
  markOnToday: {
    backgroundColor: colors.primaryForeground,
  },
  chosen: {
    gap: 2,
    paddingTop: spacing.md,
  },
  label: {
    fontFamily: fonts.semibold,
    letterSpacing: 1.5,
  },
});
