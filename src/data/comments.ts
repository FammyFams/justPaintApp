import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

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
