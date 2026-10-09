import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { spacing } from '@/theme';

type RequireAccountProps = {
  // In the require-account sheet: the sign-in screens take the sheet's place.
  inSheet?: boolean;
};

// What signed-out people see where an account is needed: Post, Activity,
// Profile, and the sheet a heart or comment opens.
export function RequireAccount({ inSheet }: RequireAccountProps) {
  const open = (href: '/sign-in' | '/sign-up') =>
    inSheet ? router.replace(href) : router.push(href);

  return (
    <View style={styles.panel}>
      {/* The sheet needs the reason; the tabs say it in their own line. */}
      {inSheet && (
        <View style={styles.words}>
          <Text variant="headline" style={styles.center}>
            sign in to post, heart and comment
          </Text>
          <Text variant="subhead" style={styles.center}>
            it&apos;s free. Looking around never needs an account.
          </Text>
        </View>
      )}
      <Button variant="circled" title="Sign in" onPress={() => open('/sign-in')} style={styles.signIn} />
      <Button title="Create an account" onPress={() => open('/sign-up')} style={styles.create} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: spacing.md,
  },
  words: {
    gap: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  signIn: {
    alignSelf: 'center',
  },
  create: {
    alignSelf: 'stretch',
  },
});
