import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { errorMessage, useSession } from '@/data/account';
import { useDeletePainting, type Painting } from '@/data/paintings';
import { spacing } from '@/theme';

// Only on your own paintings. Asks first; once it's gone, goes back.
export function DeletePaintingButton({ painting }: { painting: Painting }) {
  const { userId } = useSession();
  const remove = useDeletePainting();
  if (!userId || painting.artistId !== userId) return null;

  const confirm = () =>
    Alert.alert('delete this painting?', "it'll be gone for good, with its hearts and comments.", [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'delete',
        style: 'destructive',
        onPress: () => remove.mutate(painting.id, { onSuccess: () => router.back() }),
      },
    ]);

  return (
    <View style={styles.wrap}>
      <FormError message={remove.error && errorMessage(remove.error)} />
      <Button title="delete painting" onPress={confirm} loading={remove.isPending} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
