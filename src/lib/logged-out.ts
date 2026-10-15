import { router } from 'expo-router';

import { showToast } from '@/lib/toast';

// "You were logged out.", like the website: shown when the session ends on its
// own (a refresh rejected, the account deleted, an API call answering 401).
// Log out and Delete account call expectLogout() first, so they don't show it.
// Network trouble never ends the session, so it never shows this either.
let expected = false;

export function expectLogout() {
  expected = true;
}

// Called for every sign-out of a signed-in person.
export function noticeLogout() {
  if (expected) {
    expected = false;
    return;
  }
  showToast({
    id: 'logged-out',
    title: 'You were logged out.',
    message: 'Log in again to post, heart and comment as you.',
    action: { title: 'Log in', onPress: () => router.push('/sign-in') },
    duration: 15000,
  });
}
