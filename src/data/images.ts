import { supabase } from '@/lib/supabase';

// Public URL of a stored painting, straight from Supabase (never through Vercel's
// resizer). Stored files are WebP (or GIF), at most 1600px wide.
export function paintingImageUrl(imagePath: string): string {
  return supabase.storage.from('paintings').getPublicUrl(imagePath).data.publicUrl;
}

// The 640px wide copy stored next to every painting (website W10,
// lib/painting-sizes.ts: alice/<id>.webp has alice/<id>.640.webp). For cards,
// where the full file would be several times the bytes for no visible gain.
export function paintingCardImageUrl(imagePath: string): string {
  return paintingImageUrl(`${imagePath.replace(/\.[^./]+$/, '')}.640.webp`);
}
