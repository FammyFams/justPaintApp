import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { errorMessage, ME_KEY, useSession } from '@/data/account';
import { updateCachedPainting, type Painting } from '@/data/paintings';
import { api } from '@/lib/api';

// Hearts need an account in the app (the website also counts guests' hearts,
// per IP). Which paintings you hearted is a private read: W2's GET /hearts,
// asked once per session (newest 1,000) and kept current here as you heart.

const heartsKey = (userId: string | null) => [...ME_KEY, 'hearts', userId];

export function useHeartedIds() {
  const { userId } = useSession();
  return useQuery({
    queryKey: heartsKey(userId),
    queryFn: async () => (await api<{ hearted: string[] }>('hearts')).hearted,
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

type HeartAnswer = { hearted: boolean; count: number };

// One painting's heart: whether you hearted it, its count, and changes that
// show at once and take the website's count when it answers. Signed out,
// changing it opens the "sign in to post, heart and comment" sheet.
export function useHeart(painting: Painting) {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const heartedIds = useHeartedIds();
  const hearted = heartedIds.data?.includes(painting.id) ?? false;
  // Shared by every heart for this painting (the card's button and its
  // double tap), so only one change is ever on its way.
  const mutationKey = ['heart', painting.id];
  const saving = useIsMutating({ mutationKey }) > 0;

  const show = (on: boolean, count: number) => {
    queryClient.setQueryData<string[]>(heartsKey(userId), (ids = []) => [
      ...ids.filter((id) => id !== painting.id),
      ...(on ? [painting.id] : []),
    ]);
    updateCachedPainting(queryClient, painting.id, (cached) => ({ ...cached, heartCount: count }));
  };

  const mutation = useMutation({
    mutationKey,
    mutationFn: (on: boolean) =>
      api<HeartAnswer>(`hearts/${painting.id}`, { method: 'PUT', body: { hearted: on } }),
    onMutate: (on) => {
      const before = painting.heartCount;
      show(on, Math.max(0, before + (on ? 1 : -1)));
      return { before };
    },
    onSuccess: (answer) => show(answer.hearted, answer.count),
    onError: (error, on, context) => {
      if (context) show(!on, context.before);
      Alert.alert("couldn't save your heart", errorMessage(error));
    },
  });

  // False when signed out (the sheet opens instead).
  const change = (on: boolean): boolean => {
    if (!userId) {
      router.push('/require-account');
      return false;
    }
    // One change at a time (answers could arrive out of order), and not
    // before the hearts load, or that answer would overwrite this one.
    if (saving || heartedIds.isPending || on === hearted) return true;
    if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
    mutation.mutate(on);
    return true;
  };

  return {
    hearted,
    count: painting.heartCount,
    saving,
    toggle: () => change(!hearted),
    // A double tap on the picture: hearts it, never takes a heart back.
    heart: () => change(true),
  };
}
