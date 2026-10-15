import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ME_KEY, useSession } from '@/data/account';
import { api } from '@/lib/api';

// Hearts and comments on your paintings, from the website (W7): the same list
// as justpaint.art/notifications. Opening the Activity tab marks them all seen
// (useSeeAll); the rows keep their "new" dot for that visit. Tapping a row
// also records the tap (the website decides how much a tap clears: TAP_MARKS
// in its lib/notifications.ts), so after a tap the list is asked for again.

type NotifiedPainting = {
  id: string;
  title: string;
  imageUrl: string;
  // The 256px copy, for the row's picture.
  thumbUrl: string;
};

export type Notification =
  | {
      kind: 'comment';
      id: string;
      at: string;
      painting: NotifiedPainting;
      new: boolean;
      authorName: string;
      body: string;
    }
  | {
      kind: 'hearts';
      id: string;
      // The newest heart that day.
      at: string;
      painting: NotifiedPainting;
      new: boolean;
      count: number;
    };

const listKey = (userId: string | null) => [...ME_KEY, 'notifications', userId];
const countKey = (userId: string | null) => [...ME_KEY, 'notifications', 'count', userId];

// The last 30 days, newest first, 50 at most. Asked for when the tab shows
// and on pull to refresh: it reads up to 1,000 hearts on the server, so it
// isn't polled.
const fetchNotifications = async () => (await api<{ items: Notification[] }>('notifications')).items;

export function useNotifications() {
  const { userId } = useSession();
  return useQuery({
    queryKey: listKey(userId),
    queryFn: fetchNotifications,
    enabled: !!userId,
  });
}

// Opening Activity: the list loads first (joining a load already under way),
// so its rows still show what's new on this visit, then everything is marked
// seen (the website's mark-all, W7) and the count on the tab and the app icon
// goes to 0. Nothing new: nothing is sent, the count is just checked again.
export function useSeeAll() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useCallback(async () => {
    if (!userId) return;
    try {
      const items = await queryClient.fetchQuery({
        queryKey: listKey(userId),
        queryFn: fetchNotifications,
        staleTime: 0,
      });
      if (!items.some((item) => item.new)) {
        queryClient.invalidateQueries({ queryKey: countKey(userId) });
        return;
      }
      const { unreadCount } = await api<{ unreadCount: number }>('notifications/seen', {
        method: 'POST',
        body: {},
      });
      queryClient.setQueryData(countKey(userId), unreadCount);
    } catch {
      // The list shows its own error; the count stays until the next visit.
    }
  }, [queryClient, userId]);
}

// The number on the Activity tab: one cheap database call, refreshed when the
// app comes back to the foreground and after every tap.
export function useUnreadCount() {
  const { userId } = useSession();
  return useQuery({
    queryKey: countKey(userId),
    queryFn: async () => (await api<{ unreadCount: number }>('notifications?count')).unreadCount,
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

// Tapping a row: it shows as seen at once, the website records the tap and
// answers with the new count, then the list reloads (a tap may clear other
// rows too, depending on the website's setting). A failed tap changes nothing
// worth telling anyone about: the row just shows as new again.
export function useTapNotification() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api<{ unreadCount: number }>('notifications/seen', { method: 'POST', body: { id } }))
        .unreadCount,
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(listKey(userId), (items) =>
        items?.map((item) => (item.id === id ? { ...item, new: false } : item)),
      );
    },
    onSuccess: (unreadCount) => {
      queryClient.setQueryData(countKey(userId), unreadCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey(userId) });
    },
  });
}
