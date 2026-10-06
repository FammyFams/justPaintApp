import { supabase } from '@/lib/supabase';

// Public URL of a stored painting, straight from Supabase (never through Vercel's
// resizer). Stored files are WebP, at most 1600px wide. Until W10 adds small
// sizes, every screen loads that original file.
export function paintingImageUrl(imagePath: string): string {
  return supabase.storage.from('paintings').getPublicUrl(imagePath).data.publicUrl;
}
