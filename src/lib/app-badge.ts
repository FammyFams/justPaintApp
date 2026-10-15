import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useSession } from '@/data/account';
import { useUnreadCount } from '@/data/notifications';
import { Notifications } from '@/lib/notifications-module';

// The number on the app icon (iPhone home screen): unread hearts and comments,
// the same count as the Activity tab's. The app sets it while it's open, so a
// closed app shows the last count it saw, until pushes (W13) bring a fresh one.
// iPhones only show it once notifications are allowed (asked with push, A30);
// before that, setting it does nothing. 0 when signed out.
export function useAppBadge() {
  const { signedIn } = useSession();
  const unread = useUnreadCount().data ?? 0;
  const count = signedIn ? unread : 0;

  useEffect(() => {
    if (Platform.OS !== 'ios' || !Notifications) return;
    Notifications.setBadgeCountAsync(count).catch(() => {});
  }, [count]);
}
