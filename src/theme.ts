import type { TextStyle } from 'react-native';

// Same tokens as the website (app/globals.css). Light mode only.
export const colors = {
  background: '#fbf5f3', // every screen
  foreground: '#000022', // text, icons, focus ring
  card: '#fffdfc', // cards, sheets, menus
  primary: '#c42847', // accent only: hearts, links, small labels, the hand circle, tab tint
  primaryForeground: '#fbf5f3', // text on crimson
  muted: '#f2e6e2', // chips, pressed rows
  mutedForeground: '#5a586c', // dates, captions
  accent: '#e28413', // highlights only, always with navy text
  accentForeground: '#000022',
  // 4.0:1 on the page: fine for icons, borders and large text, not small text.
  error: '#de3c4b',
  border: '#eaddd8', // hairlines
  input: '#948985', // text box edges (3:1)
} as const;

// Font family names, as registered with useFonts in src/app/_layout.tsx.
// Static font files: set the weight with fontFamily, never fontWeight.
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  italic: 'PlusJakartaSans_400Regular_Italic',
  semibold: 'PlusJakartaSans_600SemiBold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

// 4-point grid. Screen edge padding is md.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Everything uses the same corner. No pills.
export const radius = 4;

// Minimum touch target (Apple 44pt).
export const touchTarget = 44;

// The paper grain tile is drawn at this opacity (website: 0.02).
export const paperGrainOpacity = 0.02;

export const type = {
  largeTitle: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36, color: colors.foreground },
  title: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, color: colors.foreground },
  // The daily challenge prompt: big and italic, like the website.
  prompt: { fontFamily: fonts.italic, fontSize: 26, lineHeight: 32, color: colors.foreground },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.foreground },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: colors.foreground },
  subhead: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.mutedForeground },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.mutedForeground },
} as const satisfies Record<string, TextStyle>;
