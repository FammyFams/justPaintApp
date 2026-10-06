import { useQuery } from '@tanstack/react-query';

import { artistSlug, isUuid } from '@/lib/artist-url';
import { supabase } from '@/lib/supabase';

export type Artist = {
  id: string;
  displayName: string;
  bio: string;
  joinedAt: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  created_at: string;
};

const PROFILE_SELECT = 'id, display_name, bio, created_at';

function toArtist(row: ProfileRow): Artist {
  return {
    id: row.id,
    displayName: row.display_name || 'unnamed artist',
    bio: row.bio || '',
    joinedAt: row.created_at,
  };
}

async function fetchArtistById(id: string): Promise<Artist | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toArtist(data) : null;
}

// Same matching as the website's getArtistBySlug: the address matches a name
// ignoring case, with dashes for spaces.
async function fetchArtistBySlug(slug: string): Promise<Artist | null> {
  if (!/^[A-Za-z0-9._-]{1,60}$/.test(slug)) return null;
  const wanted = slug.toLowerCase();
  // In ilike, "_" matches any one character; escape real underscores first.
  const pattern = slug.replace(/_/g, '\\_').replace(/-/g, '_');
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .ilike('display_name', pattern)
    .order('created_at', { ascending: true })
    .limit(10);
  if (error) throw error;
  const matches = (data ?? []).filter(
    (row) => artistSlug(row.display_name ?? '').toLowerCase() === wanted,
  );
  // "Ash W" and "ash-w" would share an address: the name spelled exactly like
  // the address wins, then the older account.
  const row =
    matches.find((r) => r.display_name?.trim().toLowerCase() === wanted) ?? matches[0];
  return row ? toArtist(row) : null;
}

// From an /artist/[name] handle: a name, or an old id link. Null if no one matches.
export function useArtist(handle: string) {
  return useQuery({
    queryKey: ['artists', handle.toLowerCase()],
    queryFn: () => (isUuid(handle) ? fetchArtistById(handle) : fetchArtistBySlug(handle)),
  });
}
