import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { PaperBackground } from '@/components/paper-background';
import { Text } from '@/components/text';
import { useNotifications, useTapNotification, useUnreadCount } from '@/data/notifications';
import { ActivityRow } from '@/screens/activity/activity-row';
import { colors, spacing } from '@/theme';

// The signed-in Activity tab: hearts and comments on your paintings, newest
// first. Opening the tab marks nothing; tapping a row does, then opens the
// painting.
export function ActivityList() {
  const notifications = useNotifications();
  const unread = useUnreadCount();
  const tap = useTapNotification();
  const [refreshing, setRefreshing] = useState(false);

  // Fresh each time the tab comes into view (it stays mounted between visits);
  // the first time, the queries are already loading.
  const shownBefore = useRef(false);
  const { refetch: refetchList } = notifications;
  const { refetch: refetchCount } = unread;
  useFocusEffect(
    useCallback(() => {
      if (shownBefore.current) {
        refetchList();
        refetchCount();
      }
      shownBefore.current = true;
    }, [refetchList, refetchCount]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchList(), refetchCount()]);
    setRefreshing(false);
  };

  return (
    <PaperBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <FlatList
          data={notifications.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ActivityRow
              item={item}
              onPress={() => {
                tap.mutate(item.id);
                router.push({ pathname: '/painting/[id]', params: { id: item.painting.id } });
              }}
            />
          )}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <View style={styles.heading}>
              <Text variant="display" accessibilityRole="header">
                Activity
              </Text>
              <Text variant="subhead">Hearts and comments on your paintings from the last 30 days.</Text>
              {notifications.isRefetchError && (
                <Text variant="caption">Couldn&apos;t refresh. Pull down to try again.</Text>
              )}
            </View>
          }
          ListEmptyComponent={
            notifications.isPending ? (
              <ActivityIndicator
                color={colors.mutedForeground}
                accessibilityLabel="loading your activity"
                style={styles.spinner}
              />
            ) : notifications.isError ? (
              <View style={styles.message}>
                <Text variant="subhead">Couldn&apos;t load your activity.</Text>
                <Button title="Try again" onPress={() => notifications.refetch()} />
              </View>
            ) : (
              <Text variant="subhead" style={styles.message}>
                Nothing yet. When someone hearts or comments on your paintings, it shows up here.
              </Text>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.mutedForeground}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  heading: {
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  spinner: {
    marginTop: spacing.xl,
  },
  message: {
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
