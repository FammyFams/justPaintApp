import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import type { Notification } from '@/data/notifications';
import { formatTimeAgo } from '@/lib/dates';
import { colors, fonts, radius, spacing, touchTarget } from '@/theme';

// "6 others have liked Pumpkin" (the wording asked for, 2026-10-07). Hearts
// carry no names, so one heart is "someone".
function heartsLead(count: number) {
  return count === 1 ? 'someone liked' : `${count} others have liked`;
}

type ActivityRowProps = {
  item: Notification;
  onPress: () => void;
};

// One notification: the painting's small picture, what happened, when, and a
// crimson dot while it's new. The whole row opens the painting.
export function ActivityRow({ item, onPress }: ActivityRowProps) {
  // The 256px copy, or the stored file if the copy is missing.
  const [picture, setPicture] = useState(item.painting.thumbUrl);
  const when = formatTimeAgo(item.at);
  const summary =
    item.kind === 'comment'
      ? `${item.authorName} commented on ${item.painting.title}: ${item.body}`
      : `${heartsLead(item.count)} ${item.painting.title}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.new ? 'new. ' : ''}${summary}. ${when}`}
      accessibilityHint="opens the painting"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: picture }}
        onError={() => setPicture(item.painting.imageUrl)}
        recyclingKey={item.id}
        cachePolicy="disk"
        contentFit="cover"
        style={styles.picture}
      />
      <View style={styles.words}>
        {item.kind === 'comment' ? (
          <Text numberOfLines={3}>
            <Text style={styles.strong}>{item.authorName}</Text> commented on{' '}
            <Text style={styles.strong}>{item.painting.title}</Text>: “{item.body}”
          </Text>
        ) : (
          <Text>
            {heartsLead(item.count)} <Text style={styles.strong}>{item.painting.title}</Text>
          </Text>
        )}
        <Text variant="caption">{when}</Text>
      </View>
      {/* Kept when seen, so the words don't reflow after a tap. */}
      <View style={[styles.dot, !item.new && styles.seen]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: touchTarget,
    paddingVertical: spacing.md,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  picture: {
    width: 56,
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.muted,
  },
  words: {
    flex: 1,
    gap: 2,
  },
  strong: {
    fontFamily: fonts.semibold,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
  },
  seen: {
    opacity: 0,
  },
});
