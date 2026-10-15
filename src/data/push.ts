import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';
import { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';

import { ME_KEY, useSession } from '@/data/account';
import { useTapNotification } from '@/data/notifications';
import { Notifications } from '@/lib/notifications-module';
import {
  isPushOn,
  refreshPush,
  shouldAskAfterPost,
  turnOffPush,
  turnOnPush,
  type TurnOnResult,
} from '@/lib/push';
import { showToast } from '@/lib/toast';

// Push notifications (A30): the Settings switch, the question after a post,
// and what happens when one arrives or is tapped. The pushes themselves, and
// their wording, come from the website (lib/push.ts here explains).

// Asked once per phone, a moment after a post opens.
const ASK_TITLE = 'Want to know when someone likes or comments on your paintings?';
const ASK_DELAY_MS = 1500;

const settingKey = (userId: string | null) => [...ME_KEY, 'push', userId];

// The phone's settings have notifications off, so asking again shows nothing.
function showBlocked() {
  Alert.alert('Notifications are off', "Turn them on for justPaint Art in your phone's settings.", [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open settings', onPress: () => Linking.openSettings() },
  ]);
}

/** Whether pushes reach this phone for the signed-in account. Checked again when the app comes back. */
export function usePushSetting() {
  const { userId } = useSession();
  return useQuery({
    queryKey: settingKey(userId),
    queryFn: () => isPushOn(userId!),
    enabled: !!userId,
  });
}

export function useTurnOnPush() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useMutation({
    mutationFn: (): Promise<TurnOnResult> => turnOnPush(userId!),
    onSuccess: (result) => {
      queryClient.setQueryData(settingKey(userId), result === 'on');
      if (result === 'blocked') showBlocked();
    },
  });
}

export function useTurnOffPush() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useMutation({
    mutationFn: turnOffPush,
    onSuccess: () => queryClient.setQueryData(settingKey(userId), false),
  });
}

/** After a post: once per phone, asks whether to turn notifications on. */
export function useAskAfterPost() {
  const { userId } = useSession();
  const { mutate: turnOn } = useTurnOnPush();
  return useCallback(async () => {
    if (!userId || !(await shouldAskAfterPost(userId))) return;
    setTimeout(() => {
      Alert.alert(ASK_TITLE, 'You can change this any time in Settings.', [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Turn on',
          onPress: () =>
            turnOn(undefined, {
              onError: () =>
                showToast({
                  id: 'push',
                  title: "Couldn't turn on notifications.",
                  message: 'Try again from Settings.',
                }),
            }),
        },
      ]);
    }, ASK_DELAY_MS);
  }, [userId, turnOn]);
}

/**
 * In the root layout, once the first screen is up (ready). Keeps this phone's
 * token current, refreshes Activity when a push arrives while the app is open,
 * and opens the painting when one is tapped, marking it seen like a tap on
 * its Activity row. A tap that launched the app counts too.
 */
export function usePush(ready: boolean) {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const { mutate: markTapped } = useTapNotification();

  useEffect(() => {
    if (userId) refreshPush(userId).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!Notifications) return;
    const subscription = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: [...ME_KEY, 'notifications'] });
    });
    return () => subscription.remove();
  }, [queryClient]);

  useEffect(() => {
    const notifications = Notifications;
    if (!ready || !notifications) return;

    const open = (response: NotificationResponse | null) => {
      if (response?.actionIdentifier !== notifications.DEFAULT_ACTION_IDENTIFIER) return;
      // Handled once, even if this layout mounts again.
      notifications.clearLastNotificationResponse();
      const { paintingId, notificationId } = response.notification.request.content.data ?? {};
      if (typeof paintingId !== 'string') return;
      router.push({ pathname: '/painting/[id]', params: { id: paintingId } });
      if (typeof notificationId === 'string') markTapped(notificationId);
    };

    open(notifications.getLastNotificationResponse());
    const subscription = notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [ready, markTapped]);
}
