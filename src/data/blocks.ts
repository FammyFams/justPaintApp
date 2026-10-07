import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ME_KEY, useSession } from '@/data/account';
import { api } from '@/lib/api';

// Blocked artists (W8). Their paintings and comments are hidden from you
// everywhere in the app; they're never told. Only changes from this app (the
// website has no block button), so it's read once per sign-in and then kept
// in step by block and unblock.

export type BlockedArtist = {
  id: string;
  displayName: string;
  blockedAt: string;
};

const blocksKey = (userId: string | null) => [...ME_KEY, 'blocks', userId];

export function useBlocks() {
  const { userId } = useSession();
  return useQuery({
    queryKey: blocksKey(userId),
    queryFn: async () => (await api<{ blocked: BlockedArtist[] }>('blocks')).blocked,
    enabled: !!userId,
    staleTime: Infinity,
  });
}

const NONE = new Set<string>();

// The ids to hide. Empty while signed out or still loading.
export function useBlockedIds(): Set<string> {
  const { data } = useBlocks();
  return useMemo(() => (data ? new Set(data.map((artist) => artist.id)) : NONE), [data]);
}

export function useBlock() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useMutation({
    mutationFn: async (artistId: string) =>
      (
        await api<{ blocked: { id: string; displayName: string } }>('blocks', {
          method: 'POST',
          body: { userId: artistId },
        })
      ).blocked,
    onSuccess: (artist) => {
      queryClient.setQueryData<BlockedArtist[]>(blocksKey(userId), (list = []) => [
        { ...artist, blockedAt: new Date().toISOString() },
        ...list.filter((a) => a.id !== artist.id),
      ]);
    },
  });
}

export function useUnblock() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useMutation({
    mutationFn: async (artistId: string) => {
      await api<{ unblocked: true }>(`blocks/${artistId}`, { method: 'DELETE' });
      return artistId;
    },
    onSuccess: (artistId) => {
      queryClient.setQueryData<BlockedArtist[]>(blocksKey(userId), (list = []) =>
        list.filter((a) => a.id !== artistId),
      );
    },
  });
}
