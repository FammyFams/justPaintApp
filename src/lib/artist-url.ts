// Same as the website (lib/artist-url.ts). Profile addresses use the display name
// as written: "Gubigub" → /artist/Gubigub, "Ash W" → /artist/Ash-W. Names are
// unique ignoring case and only use letters, numbers, spaces, dots, dashes and
// underscores. Old /artist/<id> links still work.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME = /^[A-Za-z0-9._ -]+$/;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function artistSlug(displayName: string): string {
  return displayName.trim().replace(/ +/g, '-');
}

// The handle for /artist/[name]: the name, or the id when the name isn't usable.
export function artistHandle(artist: { id: string; displayName?: string | null }): string {
  const name = artist.displayName?.trim();
  return name && NAME.test(name) ? artistSlug(name) : artist.id;
}
