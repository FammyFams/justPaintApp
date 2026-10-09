import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { File as LocalFile } from 'expo-file-system';

import { paintingCardImageUrl, paintingImageUrl } from '@/data/images';
import { api } from '@/lib/api';
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
  // 640px copy of imageUrl, for cards.
  cardImageUrl: string;
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
    cardImageUrl: paintingCardImageUrl(row.image_path),
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

// Every painting from a paged list, in order, each once (offset paging can
// repeat one when a new post arrives mid-scroll).
export function paintingsOf(data: InfiniteData<FeedPage, unknown> | undefined): Painting[] {
  const seen = new Set<string>();
  return (data?.pages ?? [])
    .flatMap((page) => page.paintings)
    .filter((painting) => !seen.has(painting.id) && seen.add(painting.id));
}

// Pull to refresh starts a paged list over from its first page, instead of
// re-fetching every page scrolled so far.
function useRefreshFromTop(queryKey: readonly unknown[], refetch: () => Promise<unknown>) {
  const queryClient = useQueryClient();
  return async () => {
    queryClient.setQueryData<InfiniteData<FeedPage, unknown>>(
      queryKey,
      (data) => data && { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) },
    );
    await refetch();
  };
}

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
  const query = useInfiniteQuery({
    queryKey: FEED_KEY,
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? last.paintings.at(-1)?.createdAt : undefined),
  });
  const refresh = useRefreshFromTop(FEED_KEY, query.refetch);
  return { ...query, refresh };
}

const CHALLENGE_KEY = ['paintings', 'challenge'];

// October challenge entries, newest day first, then newest post (the website's
// /feed/october order). Paged by offset, since the order isn't by time alone; a
// new entry lands on today, at the top, so it only pushes rows down: the next
// page may repeat one (paintingsOf drops it) but never skips one.
async function fetchChallengePage(offset: number): Promise<FeedPage> {
  const { data, error } = await supabase
    .from('paintings')
    .select(PAINTING_SELECT)
    .eq('october_challenge', true)
    .order('october_day', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    // One extra row tells whether there are more.
    .range(offset, offset + FEED_PAGE_SIZE);
  if (error) throw error;
  const rows = data as unknown as PaintingRow[];
  return {
    paintings: rows.slice(0, FEED_PAGE_SIZE).map(toPainting),
    hasMore: rows.length > FEED_PAGE_SIZE,
  };
}

export function useChallengeEntries() {
  const query = useInfiniteQuery({
    queryKey: CHALLENGE_KEY,
    queryFn: ({ pageParam }) => fetchChallengePage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length * FEED_PAGE_SIZE : undefined),
  });
  const refresh = useRefreshFromTop(CHALLENGE_KEY, query.refetch);
  return { ...query, refresh };
}

// A painting already loaded by any list (feed, challenge, an artist page).
function findCachedPainting(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): Painting | undefined {
  for (const [, data] of queryClient.getQueriesData<unknown>({ queryKey: ['paintings'] })) {
    const list: Painting[] = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && 'pages' in data
        ? paintingsOf(data as InfiniteData<FeedPage, unknown>)
        : [];
    const found = list.find((painting) => painting.id === id);
    if (found) return found;
  }
  return undefined;
}

// Changes one painting in every list and page that has it cached, so a new
// heart count shows on the feed card and the painting page at once.
export function updateCachedPainting(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  update: (painting: Painting) => Painting,
) {
  const swap = (list: Painting[]) =>
    list.some((painting) => painting.id === id)
      ? list.map((painting) => (painting.id === id ? update(painting) : painting))
      : list;

  queryClient.setQueriesData<unknown>({ queryKey: ['paintings'] }, (data: unknown) => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return swap(data);
    if ('pages' in data) {
      const paged = data as InfiniteData<FeedPage, unknown>;
      return { ...paged, pages: paged.pages.map((page) => ({ ...page, paintings: swap(page.paintings) })) };
    }
    const painting = data as Painting;
    return painting.id === id ? update(painting) : data;
  });
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
    // Opens instantly with what a list already loaded, then refreshes.
    placeholderData: () => findCachedPainting(queryClient, id),
  });
}

// Everything one artist posted, newest first (the website loads them all too).
export function useArtistPaintings(artistId: string | undefined) {
  return useQuery({
    queryKey: ['paintings', 'artist', artistId],
    queryFn: async (): Promise<Painting[]> => {
      const { data, error } = await supabase
        .from('paintings')
        .select(PAINTING_SELECT)
        .eq('owner_id', artistId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as PaintingRow[]).map(toPainting);
    },
    enabled: !!artistId,
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

// Same limits as the website's upload form; the website checks them again.
export const TITLE_MAX = 80;
export const DESCRIPTION_MAX = 600;
export const TAGS_MAX = 5;

export type NewPainting = {
  // A JPEG already shrunk to 1600px (screens/post/pick-photo.ts).
  photo: { uri: string; aspect: Painting['aspect'] } | null;
  title: string;
  description: string;
  tags: string[];
  // The October challenge day it's for, or null.
  challengeDay: number | null;
};

// Quick checks so an incomplete form doesn't need a round trip (and doesn't
// use up one of the 5 posts per 16 hours).
function checkNewPainting(values: NewPainting): asserts values is NewPainting & {
  photo: NonNullable<NewPainting['photo']>;
} {
  if (!values.photo) throw new Error('Add a photo of your painting.');
  if (values.title.trim().length < 2) throw new Error('Give it a title.');
  if (!values.description.trim()) throw new Error('Add a description.');
  if (values.tags.length === 0) throw new Error('Pick at least one tag.');
}

// Posts through the website (W6): 4 MB at most, re-encoded there with no
// metadata, 5 posts per 16 hours. Resolves to the new painting's id; every
// list reloads so it shows at the top.
export function usePostPainting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: NewPainting): Promise<string> => {
      checkNewPainting(values);
      const form = new FormData();
      // The global fetch is expo/fetch, which takes an expo-file-system File
      // (a Blob, typed from its .jpg name), not React Native's { uri } parts.
      form.append('image', new LocalFile(values.photo.uri));
      form.append('title', values.title.trim());
      form.append('description', values.description.trim());
      for (const tag of values.tags) form.append('tags', tag);
      form.append('aspect', values.photo.aspect);
      // Confirmed by posting (the line above the button), as at sign-up.
      form.append('agreedToTerms', 'true');
      if (values.challengeDay) {
        form.append('octoberChallenge', 'true');
        form.append('octoberDay', String(values.challengeDay));
      }
      const answer = await api<{ painting: { id: string } }>('paintings', {
        method: 'POST',
        body: form,
      });
      return answer.painting.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paintings'] }),
  });
}

// Deletes one of your own paintings, with its hearts and comments. Every list
// reloads; the painting's own page is left alone so it doesn't flash "isn't
// here anymore" while the screen goes back.
export function useDeletePainting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ deleted: true }>(`paintings/${id}`, { method: 'DELETE' }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['paintings'],
        predicate: (query) => query.queryKey[1] !== 'detail',
      }),
  });
}
