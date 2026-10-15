import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { useTurnOnPush } from '@/data/push';
import { Notifications } from '@/lib/notifications-module';
import { spacing } from '@/theme';

// iPhone only: shown until Apple's notification prompt has been answered,
// which is asked here (or after a post, or from Settings), never at launch.
// Turning on here turns on pushes (A30) and the count on the app icon.
export function BadgePrompt() {
  const [askable, setAskable] = useState(false);
  const turnOnPush = useTurnOnPush();

  useEffect(() => {
    if (Platform.OS !== 'ios' || !Notifications) return;
    const { IosAuthorizationStatus } = Notifications;
    Notifications.getPermissionsAsync()
      .then((permission) =>
        setAskable(permission.ios?.status === IosAuthorizationStatus.NOT_DETERMINED),
      )
      .catch(() => {});
  }, []);

  if (!askable) return null;

  const turnOn = () => turnOnPush.mutate(undefined, { onSettled: () => setAskable(false) });

  return (
    <View style={styles.prompt}>
      <Text variant="subhead">Turn on notifications to hear about new hearts and comments.</Text>
      <Button title="Turn on notifications" loading={turnOnPush.isPending} onPress={turnOn} />
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
});
