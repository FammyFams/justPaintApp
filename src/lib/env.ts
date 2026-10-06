// Inlined at build time from .env (copy .env.example). Restart the dev server after
// changing it. Expo only inlines `process.env.EXPO_PUBLIC_*` written out in full.
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is missing. Copy .env.example to .env and fill it in, then restart the dev server with \`npx expo start --clear\` (it only reads .env when it starts).`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: required(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  // The website. Writes and private reads go to `${siteUrl}/api/app/v1/*`.
  siteUrl: required('EXPO_PUBLIC_SITE_URL', process.env.EXPO_PUBLIC_SITE_URL),
};
