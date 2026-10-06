const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

// "october 6, 2026": lowercase, like the rest of the app's voice.
export function formatDate(iso: string): string {
  return longDate.format(new Date(iso)).toLowerCase();
}
