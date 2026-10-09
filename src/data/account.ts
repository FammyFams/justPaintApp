import {
  isAuthApiError,
  isAuthRetryableFetchError,
  type AuthError,
  type Session,
} from '@supabase/supabase-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { File as LocalFile } from 'expo-file-system';

import { api, ApiError } from '@/lib/api';
import { env } from '@/lib/env';
import { queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';

// Signing in, out and up. Sign-in and password resets go to Supabase directly;
// sign-up goes through the website (W5), which checks the name rules and limits.
//
// Everything private to the signed-in person is cached under query keys that
// start with 'me', so it can all be dropped when they sign out or switch.

const SESSION_KEY = ['session'];
export const ME_KEY = ['me'];

let lastUserId: string | null | undefined;

// Supabase reports every change: the session read from storage at launch, sign
// in, sign out, token refresh, and a refresh that fails because the account was
// deleted or signed out elsewhere. Keep the cached session in step.
supabase.auth.onAuthStateChange((_event, session) => {
  queryClient.setQueryData(SESSION_KEY, session);
  const userId = session?.user.id ?? null;
  if (lastUserId !== undefined && userId !== lastUserId) {
    queryClient.removeQueries({ queryKey: ME_KEY });
  }
  lastUserId = userId;
});

export function useSession() {
  const query = useQuery({
    queryKey: SESSION_KEY,
    queryFn: async (): Promise<Session | null> => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const session = query.data ?? null;
  return {
    session,
    userId: session?.user.id ?? null,
    signedIn: !!session,
    // Still reading the saved session at launch.
    loading: query.isPending,
  };
}

export type Me = {
  id: string;
  displayName: string | null;
  bio: string;
  avatarUrl: string | null;
  joinedAt: string | null;
};

const profileKey = (userId: string | null) => [...ME_KEY, 'profile', userId];

// The signed-in person's profile, from the website (W1's /me). It also proves
// the sign-in token works.
export function useMe() {
  const { userId } = useSession();
  return useQuery({
    queryKey: profileKey(userId),
    queryFn: async () => {
      const { user } = await api<{ user: Me }>('me');
      // No profile: the account was deleted (on the website or another phone)
      // and this token hasn't run out yet (it can last an hour). Sign out here too.
      if (!user.joinedAt) await supabase.auth.signOut({ scope: 'local' });
      return user;
    },
    enabled: !!userId,
  });
}

const UNREACHABLE = "Couldn't reach the server. Check your connection and try again.";
const BUSY = 'The server is busy right now. Try again in a few minutes.';
const TOO_MANY_TRIES = 'Too many tries. Wait a bit and try again.';

// Supabase's messages are written for developers; show people these (the same
// wording as the website's lib/writes/account.ts, in the app's lowercase voice).
function authMessage(error: AuthError): string {
  if (isAuthRetryableFetchError(error)) return UNREACHABLE;
  switch (error.code) {
    case 'invalid_credentials':
      return 'Wrong email or password.';
    case 'email_not_confirmed':
      return 'Confirm your email first. Check your inbox for the link.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Enter a valid email.';
    case 'over_request_rate_limit':
      return TOO_MANY_TRIES;
    case 'over_email_send_rate_limit':
      return "The server can't send another email yet. Wait a few minutes and try again.";
  }
  if (isAuthApiError(error) && error.status === 429) return TOO_MANY_TRIES;
  return BUSY;
}

// Sentence case, like the rest of the app. The website's app API writes some
// of its own messages in lowercase ("sign in to do that."), so each sentence
// gets its capital here.
const sentenceCase = (message: string) =>
  message.replace(/(^|[.?!]\s+)([a-z])/g, (_, start: string, letter: string) => start + letter.toUpperCase());

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return sentenceCase(error.message);
  if (error instanceof Error) return sentenceCase(error.message);
  return BUSY;
}

const EMAIL = /^\S+@\S+\.\S+$/;

// Quick checks so an empty or obviously wrong form doesn't need a round trip.
// The server checks everything again.
function checkEmail(email: string) {
  if (!email) throw new Error('Enter your email.');
  if (!EMAIL.test(email)) throw new Error('Enter a valid email.');
}

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      checkEmail(email);
      if (!password) throw new Error('Enter your password.');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(authMessage(error));
    },
  });
}

export type SignUpValues = {
  displayName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
};

type SignUpAnswer = {
  needsConfirmation: boolean;
  session: { access_token: string; refresh_token: string } | null;
};

// Resolves to true when Supabase emailed a confirmation link, which opens the
// website; they sign in here after that. When confirmation is switched off the
// answer carries a session instead, and this signs in with it.
export function useSignUp() {
  return useMutation({
    mutationFn: async (values: SignUpValues): Promise<boolean> => {
      if (values.displayName.trim().length < 2) throw new Error('Pick a display name.');
      checkEmail(values.email);
      if (values.password.length < 8) throw new Error('Use at least 8 characters for your password.');
      if (!values.agreedToTerms) {
        throw new Error("Confirm you're 13 or older and agree to the terms of use.");
      }
      const answer = await api<SignUpAnswer>('auth/signup', { method: 'POST', body: values });
      if (answer.session) {
        const { error } = await supabase.auth.setSession(answer.session);
        if (error) throw new Error(authMessage(error));
        return false;
      }
      return true;
    },
  });
}

// Supabase answers the same whether or not the email has an account. The
// email's link opens the website's reset page (same as the website's form).
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      checkEmail(email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.siteUrl}/auth/confirm?next=/reset-password`,
      });
      if (error) throw new Error(authMessage(error));
    },
  });
}

// The website's limits (lib/validations there): names 2 to 30 characters of
// letters, numbers, spaces, dots, dashes and underscores; bios up to 280.
export const NAME_MAX = 30;
export const BIO_MAX = 280;

type ProfileValues = { displayName: string; bio: string };

// Name and bio, through the website (W5), which checks the name rules and
// whether someone else has it. Everything showing the old name reloads.
export function useUpdateProfile() {
  const { userId } = useSession();
  return useMutation({
    mutationFn: async (values: ProfileValues) => {
      const displayName = values.displayName.trim();
      const bio = values.bio.trim();
      if (displayName.length < 2) throw new Error('Use at least 2 characters for your name.');
      if (bio.length > BIO_MAX) throw new Error(`Keep your bio under ${BIO_MAX} characters.`);
      const answer = await api<{ profile: ProfileValues }>('profile', {
        method: 'PATCH',
        body: { displayName, bio },
      });
      return answer.profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData<Me>(profileKey(userId), (me) => me && { ...me, ...profile });
      for (const key of ['paintings', 'artists', 'comments']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

// Your picture, through the website, which crops it to the middle square, saves
// a 256 px copy with no metadata and deletes the old one. Pass a local photo to
// change it, or null to go back to initials.
export function useSetAvatar() {
  const { userId } = useSession();
  return useMutation({
    mutationFn: async (uri: string | null) => {
      if (!uri) return api<{ avatarUrl: null }>('profile/avatar', { method: 'DELETE' });
      const form = new FormData();
      // An expo-file-system File, like painting uploads (data/paintings.ts).
      form.append('image', new LocalFile(uri));
      return api<{ avatarUrl: string }>('profile/avatar', { method: 'POST', body: form });
    },
    onSuccess: ({ avatarUrl }) => {
      queryClient.setQueryData<Me>(profileKey(userId), (me) => me && { ...me, avatarUrl });
    },
  });
}

// Deletes the account and everything in it through the website (W5), then
// signs out here. Signing out closes Settings (it's only there while signed in).
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await api<{ deleted: true }>('account', { method: 'DELETE' });
      await supabase.auth.signOut({ scope: 'local' });
    },
    onSuccess: () => {
      // Their paintings and comments are gone from every list.
      for (const key of ['paintings', 'artists', 'comments']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

// Signs out this phone only: the website and other devices stay signed in.
// Supabase forgets the session here even when it can't reach the server.
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut({ scope: 'local' });
    },
  });
}
