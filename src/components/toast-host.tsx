import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { TextLink } from '@/components/text-link';
import { hideToast, useToast } from '@/lib/toast';
import { colors, radius, spacing } from '@/theme';

// Clears the tab bar on the tab screens; elsewhere it just sits a little higher.
const TAB_BAR_CLEARANCE = 64;

// Draws the toast from showToast, over every screen. Taps outside it go through.
export function ToastHost() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  const { action } = toast;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}
    >
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <Text variant="headline">{toast.title}</Text>
        {toast.message ? <Text variant="subhead">{toast.message}</Text> : null}
        {action ? (
          <TextLink
            title={action.title}
            role="link"
            onPress={() => {
              hideToast();
              action.onPress();
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  // Like the website's: card color, hairline edge, no shadow.
  toast: {
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius,
    padding: spacing.md,
  },
});
