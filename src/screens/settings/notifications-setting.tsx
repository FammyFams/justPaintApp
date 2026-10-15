import { Host, Switch } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { FormError } from '@/components/form-error';
import { Text } from '@/components/text';
import { errorMessage } from '@/data/account';
import { usePushSetting, useTurnOffPush, useTurnOnPush } from '@/data/push';
import { spacing, touchTarget } from '@/theme';

const LABEL = 'Hearts and comments';
const NOTE = 'A notification when someone likes or comments on your painting.';

// The Notifications switch in Settings (A30). Turning it on asks for the
// phone's permission first. The whole row is one switch for screen readers;
// the native switch inside is hidden from them so it isn't read twice.
export function NotificationsSetting() {
  const setting = usePushSetting();
  const turnOn = useTurnOnPush();
  const turnOff = useTurnOffPush();

  const busy = setting.isPending || turnOn.isPending || turnOff.isPending;
  // Shows the new position while it's being saved.
  const on = turnOn.isPending || (!turnOff.isPending && !!setting.data);
  const error = turnOn.error ?? turnOff.error;

  const toggle = (next: boolean) => {
    if (busy) return;
    turnOn.reset();
    turnOff.reset();
    if (next) turnOn.mutate();
    else turnOff.mutate();
  };

  return (
    <View style={styles.setting}>
      <View
        accessible
        accessibilityRole="switch"
        accessibilityLabel={LABEL}
        accessibilityHint={NOTE}
        accessibilityState={{ checked: on, disabled: busy }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'activate') toggle(!on);
        }}
        style={styles.row}
      >
        <View style={styles.words}>
          <Text variant="body">{LABEL}</Text>
          <Text variant="subhead">{NOTE}</Text>
        </View>
        <Host
          matchContents
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Switch value={on} onValueChange={toggle} disabled={busy} />
        </Host>
      </View>
      <FormError message={error && errorMessage(error)} />
    </View>
  );
}

const styles = StyleSheet.create({
  setting: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touchTarget,
  },
  words: {
    flex: 1,
    gap: spacing.xs,
  },
});
