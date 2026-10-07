import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { errorMessage, useDeleteAccount, useSignOut } from '@/data/account';
import { spacing } from '@/theme';

const DELETES =
  "this permanently deletes your profile, every painting you've uploaded, and all your hearts and comments.";

// Log out (navy, like every plain button) and delete account (asks once, in the
// website's words). Either one signs out, which closes Settings.
export function AccountActions() {
  const signOut = useSignOut();
  const remove = useDeleteAccount();

  const confirm = () =>
    Alert.alert('delete your account?', `${DELETES} this can't be undone.`, [
      { text: 'cancel', style: 'cancel' },
      { text: 'delete account', style: 'destructive', onPress: () => remove.mutate() },
    ]);

  return (
    <View style={styles.actions}>
      <Button
        title="log out"
        loading={signOut.isPending}
        disabled={remove.isPending}
        onPress={() => signOut.mutate()}
        style={styles.button}
      />
      <View style={styles.delete}>
        <Text variant="subhead">{DELETES}</Text>
        <FormError message={remove.error && errorMessage(remove.error)} />
        <Button
          title="delete account"
          loading={remove.isPending}
          onPress={confirm}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xl,
  },
  delete: {
    gap: spacing.sm,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
