import { PaperBackground } from '@/components/paper-background';
import { useSession } from '@/data/account';
import { MyProfile } from '@/screens/profile/my-profile';
import { SignedOutScreen } from '@/screens/signed-out/signed-out-screen';

export function ProfileScreen() {
  const { signedIn, loading } = useSession();
  if (loading) return <PaperBackground />;
  if (!signedIn) {
    return (
      <SignedOutScreen title="profile" note="your paintings, all in one place." />
    );
  }
  return <MyProfile />;
}
