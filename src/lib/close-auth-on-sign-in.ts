import { useRouter, usePathname, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';

// Sign in, sign up, forgot password and the "sign in to post, heart and comment" sheet.
const AUTH_PATHS = new Set(['/sign-in', '/sign-up', '/forgot-password', '/require-account']);

// Signing in closes those screens and goes back to the page they were opened
// from (a painting, the profile tab). Before SDK 58 a Stack.Protected guard did
// this; now a closed guard redirects to a fixed page instead.
export function useCloseAuthOnSignIn(signedIn: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const onAuthScreen = AUTH_PATHS.has(pathname);
  const lastPage = useRef('/');

  useEffect(() => {
    if (!onAuthScreen) lastPage.current = pathname;
  }, [onAuthScreen, pathname]);

  useEffect(() => {
    if (signedIn && onAuthScreen) router.dismissTo(lastPage.current as Href);
  }, [signedIn, onAuthScreen, router]);
}
