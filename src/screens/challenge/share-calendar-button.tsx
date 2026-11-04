import { File, Paths } from 'expo-file-system';
import { useState } from 'react';
import { Platform, Share } from 'react-native';

import { Button } from '@/components/button';
import type { Challenge } from '@/data/challenge';

// Shares the calendar picture with the same words as the website's share button.
// iOS takes a picture and text together; Android's share sheet only takes text
// from here, so it gets the words and the link, like the website's fallback.
export function ShareCalendarButton({ challenge }: { challenge: Challenge }) {
  const [busy, setBusy] = useState(false);
  const message = `${challenge.name}: one prompt a day. Paint along on justpaint! ${challenge.hashtag} ${challenge.pageUrl}`;

  const share = async () => {
    setBusy(true);
    try {
      if (Platform.OS !== 'ios') {
        await Share.share({ message });
        return;
      }
      // Named after the picture's address, which changes with the month and its
      // prompts, so an old calendar is never shared.
      const name = `${challenge.calendarUrl.replace(/[^a-z0-9]+/gi, '-')}.png`;
      let picture: File | null = new File(Paths.cache, name);
      if (!picture.exists) {
        // No picture (offline, or the site is busy): share the words and link instead.
        picture = await File.downloadFileAsync(challenge.calendarUrl, picture, {
          idempotent: true,
        }).catch(() => null);
      }
      await Share.share(picture ? { url: picture.uri, message } : { message });
    } catch {
      // The share sheet couldn't open; there's nothing to undo.
    } finally {
      setBusy(false);
    }
  };

  return <Button title="Share calendar" onPress={share} loading={busy} />;
}
