import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useMe } from '@/data/account';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Same as the website (lib/validations/comment.ts); the website checks it again.
export const COMMENT_MAX_LENGTH = 500;

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: { display_name: string } | null;
};

// Oldest first, like a conversation (same as the website).
export function useComments(paintingId: string) {
  return useQuery({
    queryKey: ['comments', paintingId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, user_id, body, created_at, profiles ( display_name )')
        .eq('painting_id', paintingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as unknown as CommentRow[]).map((row) => ({
        id: row.id,
        authorId: row.user_id,
        authorName: row.profiles?.display_name || 'someone',
        body: row.body,
        createdAt: row.created_at,
      }));
    },
  });
}

type AddedComment = { comment: { id: string; paintingId: string; body: string } };

// Posts through the website (W3): 500 characters, 5 per 10 minutes and 50 a
// day. The new comment goes on the end of the list at once, then the list
// reloads from Supabase. On failure nothing changes, so the box keeps the text.
export function useAddComment(paintingId: string) {
  const queryClient = useQueryClient();
  const me = useMe();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!body.trim()) throw new Error("Write something first.");
      return (await api<AddedComment>('comments', { method: 'POST', body: { paintingId, body } }))
        .comment;
    },
    onSuccess: (added) => {
      queryClient.setQueryData<Comment[]>(['comments', paintingId], (comments = []) => [
        ...comments,
        {
          id: added.id,
          authorId: me.data?.id ?? '',
          authorName: me.data?.displayName || 'you',
          body: added.body,
          createdAt: new Date().toISOString(),
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ['comments', paintingId] });
    },
  });
}
