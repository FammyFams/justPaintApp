import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase.from('tags').select('id, name, slug').order('name');
      if (error) throw error;
      return data;
    },
    // Tags rarely change.
    staleTime: 60 * 60 * 1000,
  });
}
