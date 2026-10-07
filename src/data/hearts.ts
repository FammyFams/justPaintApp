import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// One painting's heart: whether you hearted it, its count, and a toggle that
// shows the change at once and corrects the count when the website answers.
// Signed out, the toggle opens the "sign in to post, heart and comment" sheet.
export function useHeart(painting: Painting) {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  const heartedIds = useHeartedIds();
  const hearted = heartedIds.data?.includes(painting.id) ?? false;

  const show = (on: boolean, count: number) => {
    queryClient.setQueryData<string[]>(heartsKey(userId), (ids = []) => [
      ...ids.filter((id) => id !== painting.id),
      ...(on ? [painting.id] : []),
    ]);
    updateCachedPainting(queryClient, painting.id, (cached) => ({ ...cached, heartCount: count }));
  };

  const mutation = useMutation({
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

  const toggle = () => {
    if (!userId) {
      router.push('/require-account');
      return;
    }
    // One change at a time (answers could arrive out of order), and not
    // before the hearts load, or that answer would overwrite this one.
    if (mutation.isPending || heartedIds.isPending) return;
    const on = !hearted;
    if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
    mutation.mutate(on);
  };

  return { hearted, count: painting.heartCount, toggle, saving: mutation.isPending };
}
