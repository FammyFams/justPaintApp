import { PaperBackground } from '@/components/paper-background';
import { useSession } from '@/data/account';
import { PostForm } from '@/screens/post/post-form';
import { SignedOutScreen } from '@/screens/signed-out/signed-out-screen';

export function PostScreen() {
  const { signedIn, loading } = useSession();
  if (loading) return <PaperBackground />;
  if (!signedIn) {
    return (
      <SignedOutScreen
        title="Post"
        note="Sign in to post a painting."
      />
    );
  }
  return <PostForm />;
}
