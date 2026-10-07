import { PaperBackground } from '@/components/paper-background';
import { useSession } from '@/data/account';
import { PlaceholderScreen } from '@/screens/placeholder/placeholder-screen';
import { SignedOutScreen } from '@/screens/signed-out/signed-out-screen';

export function ActivityScreen() {
  const { signedIn, loading } = useSession();
  if (loading) return <PaperBackground />;
  if (!signedIn) {
    return (
      <SignedOutScreen
        title="activity"
        note="when someone hearts or comments on your paintings, it shows up here."
      />
    );
  }
  // A13 builds the activity list.
  return <PlaceholderScreen title="activity" />;
}
