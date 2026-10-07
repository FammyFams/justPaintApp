import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { errorMessage } from '@/data/account';
import { useUnblock } from '@/data/blocks';
import { spacing } from '@/theme';

// In place of a blocked artist's painting or page (opened from a link, say).
export function BlockedNotice({ artist }: { artist: { id: string; name: string } }) {
  const unblock = useUnblock();
  return (
    <View style={styles.notice}>
      <Text variant="headline" accessibilityRole="header">
        you blocked {artist.name}
      </Text>
      <Text variant="subhead">their paintings and comments are hidden from you.</Text>
      <FormError message={unblock.error && errorMessage(unblock.error)} />
      <Button
        title="unblock"
        loading={unblock.isPending}
        onPress={() => unblock.mutate(artist.id)}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
});
