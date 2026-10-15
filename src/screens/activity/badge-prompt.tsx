import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { Notifications } from '@/lib/notifications-module';
import { spacing } from '@/theme';

// iPhone only: the count can't show on the app icon until notifications are
// allowed. Shown until Apple's prompt has been answered, which is asked here,
// in context, never at launch. The same permission covers push alerts later.
export function BadgePrompt() {
  const [askable, setAskable] = useState(false);

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

  const turnOn = async () => {
    await Notifications?.requestPermissionsAsync().catch(() => null);
    setAskable(false);
  };

  return (
    <View style={styles.prompt}>
      <Text variant="subhead">
        Turn on notifications to see new hearts and comments as a number on the app icon.
      </Text>
      <Button title="Turn on notifications" onPress={turnOn} />
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
});
