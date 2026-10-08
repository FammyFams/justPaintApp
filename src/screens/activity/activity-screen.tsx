import { PaperBackground } from '@/components/paper-background';
import { useSession } from '@/data/account';
import { ActivityList } from '@/screens/activity/activity-list';
import { SignedOutScreen } from '@/screens/signed-out/signed-out-screen';

export function ActivityScreen() {
  const { signedIn, loading } = useSession();
  if (loading) return <PaperBackground />;
  if (!signedIn) {
    return (
      <SignedOutScreen
        title="activity"
        note="hearts and comments on your paintings."
      />
    );
  }
  return <ActivityList />;
}
