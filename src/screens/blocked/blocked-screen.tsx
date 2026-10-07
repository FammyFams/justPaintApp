import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { errorMessage } from '@/data/account';
import { useBlocks, useUnblock } from '@/data/blocks';
import { formatDate } from '@/lib/dates';
import { colors, spacing } from '@/theme';

// Settings → blocked artists, to unblock. Only while signed in.
export function BlockedScreen() {
  const blocks = useBlocks();
  const unblock = useUnblock();

  return (
    <PaperBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text variant="display" accessibilityRole="header">
            blocked artists
          </Text>
          <Text variant="subhead">
            their paintings and comments are hidden from you. they aren&apos;t told.
          </Text>
        </View>

        <FormError message={unblock.error && errorMessage(unblock.error)} />

        {blocks.data ? (
          blocks.data.length === 0 ? (
            <Text variant="subhead">you haven&apos;t blocked anyone.</Text>
          ) : (
            blocks.data.map((artist) => (
              <View key={artist.id} style={styles.row}>
                <View style={styles.words}>
                  <Text variant="headline">{artist.displayName}</Text>
                  <Text variant="caption">blocked {formatDate(artist.blockedAt)}</Text>
                </View>
                <Button
                  title="unblock"
                  loading={unblock.isPending && unblock.variables === artist.id}
                  disabled={unblock.isPending && unblock.variables !== artist.id}
                  onPress={() => unblock.mutate(artist.id)}
                />
              </View>
            ))
          )
        ) : blocks.isError ? (
          <View style={styles.state}>
            <Text variant="subhead">{errorMessage(blocks.error)}</Text>
            <Button title="try again" onPress={() => blocks.refetch()} style={styles.left} />
          </View>
        ) : (
          <ActivityIndicator
            color={colors.mutedForeground}
            accessibilityLabel="loading blocked artists"
            style={styles.left}
          />
        )}
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  words: {
    flex: 1,
    gap: 2,
  },
  state: {
    gap: spacing.sm,
  },
  left: {
    alignSelf: 'flex-start',
  },
});
