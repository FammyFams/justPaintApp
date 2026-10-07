import { PaperBackground } from '@/components/paper-background';
import { useSession } from '@/data/account';
import { PlaceholderScreen } from '@/screens/placeholder/placeholder-screen';
import { SignedOutScreen } from '@/screens/signed-out/signed-out-screen';

export function PostScreen() {
  const { signedIn, loading } = useSession();
  if (loading) return <PaperBackground />;
  if (!signedIn) {
    return (
      <SignedOutScreen
        title="post"
        note="what did you paint today? sign in to share it on the wall."
      />
    );
  }
  // A12 builds the post form.
  return <PlaceholderScreen title="post" />;
}
