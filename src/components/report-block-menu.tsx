import { MenuView, type MenuAction } from '@expo/ui/community/menu';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, StyleSheet, View } from 'react-native';

import { errorMessage, useSession } from '@/data/account';
import { useBlock } from '@/data/blocks';
import { colors, touchTarget } from '@/theme';

type ReportBlockMenuProps = {
  // Read out for the button, e.g. "more options for pumpkin".
  label: string;
  // What a report is about: always a painting. A comment is reported on its
  // painting, quoted in the details (`about`).
  report?: { paintingId: string; title: string; about?: string };
  // Whom "block" blocks. Null for a guest post (no account to block).
  artist?: { id: string; name: string } | null;
};

// A ⋯ button opening a native menu: report and/or block. Nothing on your own
// paintings and comments. Reporting works signed out; blocking asks you to
// sign in first.
export function ReportBlockMenu({ label, report, artist }: ReportBlockMenuProps) {
  const { userId, signedIn } = useSession();
  const block = useBlock();
  const own = !!artist && artist.id === userId;

  const actions: MenuAction[] = [];
  if (report && !own) actions.push({ id: 'report', title: 'Report' });
  if (artist && !own) {
    actions.push({ id: 'block', title: `Block ${artist.name}`, attributes: { destructive: true } });
  }
  if (actions.length === 0) return null;

  const confirmBlock = (target: { id: string; name: string }) =>
    Alert.alert(
      `Block ${target.name}?`,
      "You won't see their paintings or comments. They won't be told, and you can unblock them in settings.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () =>
            block.mutate(target.id, {
              onError: (error) => Alert.alert("couldn't block", errorMessage(error)),
            }),
        },
      ],
    );

  const onAction = (id: string) => {
    if (id === 'report' && report) {
      router.push({
        pathname: '/report',
        params: { painting: report.paintingId, title: report.title, about: report.about ?? '' },
      });
    } else if (id === 'block' && artist) {
      if (signedIn) confirmBlock(artist);
      else router.push('/require-account');
    }
  };

  return (
    <MenuView actions={actions} onPressAction={({ nativeEvent }) => onAction(nativeEvent.event)}>
      <View accessible accessibilityRole="button" accessibilityLabel={label} style={styles.trigger}>
        <SymbolView
          name={{ ios: 'ellipsis', android: 'more_horiz' }}
          tintColor={colors.foreground}
          size={22}
        />
      </View>
    </MenuView>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
