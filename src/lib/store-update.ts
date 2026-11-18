import Constants from 'expo-constants';
import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';

import { showToast } from '@/lib/toast';

// The app's App Store page (App Store Connect app id).
const APP_STORE_URL = 'https://apps.apple.com/app/id6819846676';
// Apple's public lookup: the version that's live in the App Store now. Apple
// caches the answer, so a new release can take up to about a day to show here.
const LOOKUP_URL = 'https://itunes.apple.com/lookup?bundleId=art.justpaint.app&country=us';
// After the launch screen (about a second, then its fade).
const DELAY = 3000;

// "1.0.10" is newer than "1.0.9": compared number by number.
export function isNewerVersion(store: string, mine: string): boolean {
  const a = store.split('.').map(Number);
  const b = mine.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (Number.isNaN(x) || Number.isNaN(y)) return false;
    if (x !== y) return x > y;
  }
  return false;
}

async function appStoreVersion(): Promise<string | undefined> {
  const response = await fetch(LOOKUP_URL);
  if (!response.ok) return undefined;
  const body = (await response.json()) as { results?: { version?: unknown }[] };
  const version = body.results?.[0]?.version;
  return typeof version === 'string' ? version : undefined;
}

// iPhone only, once per launch: when the App Store has a newer version than
// this build (a native change the phone can't get from EAS Update), a toast
// says so, with an "Update" link to the App Store. Offline or no answer from
// Apple: nothing shows.
export function useStoreUpdateNudge() {
  useEffect(() => {
    const mine = Constants.expoConfig?.version;
    if (Platform.OS !== 'ios' || !mine) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const store = await appStoreVersion();
        if (cancelled || !store || !isNewerVersion(store, mine)) return;
        showToast({
          id: 'store-update',
          title: 'A new version is out.',
          message: 'Get the latest from the App Store.',
          action: { title: 'Update', onPress: () => Linking.openURL(APP_STORE_URL) },
          duration: 10000,
        });
      } catch {
        // No connection or an odd answer: try again next launch.
      }
    }, DELAY);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
}
