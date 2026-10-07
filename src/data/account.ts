import {
  isAuthApiError,
  isAuthRetryableFetchError,
  type AuthError,
  type Session,
} from '@supabase/supabase-js';
import { useMutation, useQuery } from '@tanstack/react-query';

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

// The signed-in person's profile, from the website (W1's /me). It also proves
// the sign-in token works.
export function useMe() {
  const { userId } = useSession();
  return useQuery({
    queryKey: [...ME_KEY, 'profile', userId],
    queryFn: async () => (await api<{ user: Me }>('me')).user,
    enabled: !!userId,
  });
}

const UNREACHABLE = "couldn't reach the server. check your connection and try again.";
const BUSY = 'the server is busy right now. try again in a few minutes.';
const TOO_MANY_TRIES = 'too many tries. wait a bit and try again.';

// Supabase's messages are written for developers; show people these (the same
// wording as the website's lib/writes/account.ts, in the app's lowercase voice).
function authMessage(error: AuthError): string {
  if (isAuthRetryableFetchError(error)) return UNREACHABLE;
  switch (error.code) {
    case 'invalid_credentials':
      return 'wrong email or password.';
    case 'email_not_confirmed':
      return 'confirm your email first. check your inbox for the link.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'enter a valid email.';
    case 'over_request_rate_limit':
      return TOO_MANY_TRIES;
    case 'over_email_send_rate_limit':
      return "the server can't send another email yet. wait a few minutes and try again.";
  }
  if (isAuthApiError(error) && error.status === 429) return TOO_MANY_TRIES;
  return BUSY;
}

// The website's messages are sentence case; the app is lowercase.
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message.toLowerCase();
  if (error instanceof Error) return error.message.toLowerCase();
  return BUSY;
}

const EMAIL = /^\S+@\S+\.\S+$/;

// Quick checks so an empty or obviously wrong form doesn't need a round trip.
// The server checks everything again.
function checkEmail(email: string) {
  if (!email) throw new Error('enter your email.');
  if (!EMAIL.test(email)) throw new Error('enter a valid email.');
}

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      checkEmail(email);
      if (!password) throw new Error('enter your password.');
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
      if (values.displayName.trim().length < 2) throw new Error('pick a display name.');
      checkEmail(values.email);
      if (values.password.length < 8) throw new Error('use at least 8 characters for your password.');
      if (!values.agreedToTerms) {
        throw new Error("confirm you're 13 or older and agree to the terms of use.");
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

// Signs out this phone only: the website and other devices stay signed in.
// Supabase forgets the session here even when it can't reach the server.
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut({ scope: 'local' });
    },
  });
}
