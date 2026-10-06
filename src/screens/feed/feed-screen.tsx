import { useTags } from '@/data/paintings';
import { PlaceholderScreen } from '@/screens/placeholder/placeholder-screen';

// Temporary: proves the app reads Supabase (module A4). A5 builds the real feed.
export function FeedScreen() {
  const tags = useTags();
  const note = tags.data
    ? `${tags.data.length} tags loaded`
    : tags.error
      ? "couldn't load tags"
      : 'loading tags';
  return <PlaceholderScreen title="feed" note={note} />;
}
