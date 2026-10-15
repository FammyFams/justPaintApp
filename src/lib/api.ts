import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

// An error answer from the website's app API, which always looks like
// { error: { code, message } } (lib/api/respond.ts there). code is "network"
// when the request never got an answer. message is written to show the user.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Vercel answers some failures itself, without the website's JSON: 402 while
// the site is paused over its usage limit, 413 for a body over 4.5 MB, 429, 5xx.
function fallbackMessage(status: number): string {
  return status === 402 || status === 413 || status === 429 || status >= 500
    ? 'The server is busy right now. Try again in a few minutes.'
    : 'Something went wrong. Try again.';
}

type ApiInit = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Sent as JSON, or as multipart when it's FormData (a photo upload).
  body?: unknown;
};

// Calls justpaint.art/api/app/v1/<path> for writes and private reads, sending
// the sign-in token when there is one. Public reads go to Supabase directly.
export async function api<T>(path: string, { method = 'GET', body }: ApiInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const sendJson = body !== undefined && !(body instanceof FormData);

  let response: Response;
  try {
    response = await fetch(`${env.siteUrl}/api/app/v1/${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        // FormData sets its own multipart Content-Type, with the boundary.
        ...(sendJson && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: sendJson ? JSON.stringify(body) : (body as FormData | undefined),
    });
  } catch {
    throw new ApiError(0, 'network', "Couldn't reach justpaint.art. Check your connection.");
  }

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.error?.code ?? 'unknown',
      json?.error?.message ?? fallbackMessage(response.status),
    );
  }
  return json as T;
}
