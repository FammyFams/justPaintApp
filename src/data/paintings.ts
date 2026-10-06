import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { paintingImageUrl } from '@/data/images';
import { supabase } from '@/lib/supabase';

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Painting = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aspect: 'portrait' | 'landscape' | 'square';
  // Null for guest posts, which have no account.
  artistId: string | null;
  // The artist's profile name, or the name the guest typed.
  authorName: string;
  tags: Tag[];
  heartCount: number;
  createdAt: string;
  octoberChallenge: boolean;
  octoberDay: number | null;
};

// Width / height of each aspect bucket (the website uses the same: 3:4, 4:3, 1:1).
export const aspectRatios: Record<Painting['aspect'], number> = {
  portrait: 3 / 4,
  landscape: 4 / 3,
  square: 1,
};

// Same columns as the website (lib/paintings.ts). The profiles embed must name
// its foreign key, or PostgREST fails with "ambiguous relationship".
const PAINTING_SELECT = `
  id, title, description, image_path, aspect, owner_id, guest_name, created_at, heart_count,
  october_challenge, october_day,
  profiles!paintings_owner_id_fkey ( display_name ),
  paintings_tags ( tags ( id, name, slug ) )
`;

type PaintingRow = {
  id: string;
  title: string;
  description: string;
  image_path: string;
  aspect: Painting['aspect'];
  owner_id: string | null;
  guest_name: string | null;
  created_at: string;
  heart_count: number;
  october_challenge: boolean;
  october_day: number | null;
  profiles: { display_name: string } | null;
  paintings_tags: { tags: Tag | null }[];
};

function toPainting(row: PaintingRow): Painting {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: paintingImageUrl(row.image_path),
    aspect: row.aspect,
    artistId: row.owner_id,
    authorName: row.owner_id
      ? row.profiles?.display_name || 'unknown artist'
      : row.guest_name || 'guest',
    tags: row.paintings_tags.map((pt) => pt.tags).filter((t): t is Tag => Boolean(t)),
    heartCount: row.heart_count,
    createdAt: row.created_at,
    octoberChallenge: row.october_challenge,
    octoberDay: row.october_day,
  };
}

const FEED_PAGE_SIZE = 12;
const FEED_KEY = ['paintings', 'feed'];

type FeedPage = {
  paintings: Painting[];
  // More posts exist past this page.
  hasMore: boolean;
};

// Newest first. Pages continue from the last post's time instead of an offset,
// so new posts arriving mid-scroll don't repeat paintings on the next page.
async function fetchFeedPage(before: string | null): Promise<FeedPage> {
  let query = supabase
    .from('paintings')
    .select(PAINTING_SELECT)
    .order('created_at', { ascending: false })
    // One extra row tells whether there are more.
    .limit(FEED_PAGE_SIZE + 1);
  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data as unknown as PaintingRow[];
  return {
    paintings: rows.slice(0, FEED_PAGE_SIZE).map(toPainting),
    hasMore: rows.length > FEED_PAGE_SIZE,
  };
}

export function useFeed() {
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: FEED_KEY,
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? last.paintings.at(-1)?.createdAt : undefined),
  });

  // Pull to refresh starts over from the newest page, instead of re-fetching
  // every page scrolled so far.
  const refresh = async () => {
    queryClient.setQueryData<InfiniteData<FeedPage, string | null>>(FEED_KEY, (data) =>
      data && { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) },
    );
    await query.refetch();
  };

  return { ...query, refresh };
}

// Null when there is no such painting (deleted, or a malformed id in a link).
async function fetchPainting(id: string): Promise<Painting | null> {
  const { data, error } = await supabase
    .from('paintings')
    .select(PAINTING_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) {
    // 22P02: the id isn't a uuid, so it's a missing painting, not an outage.
    if (error.code === '22P02') return null;
    throw error;
  }
  return data ? toPainting(data as unknown as PaintingRow) : null;
}

export function usePainting(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['paintings', 'detail', id],
    queryFn: () => fetchPainting(id),
    // Opens instantly with what the feed already loaded, then refreshes.
    placeholderData: () =>
      queryClient
        .getQueryData<InfiniteData<FeedPage, string | null>>(FEED_KEY)
        ?.pages.flatMap((page) => page.paintings)
        .find((painting) => painting.id === id),
  });
}

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
