import Svg, { Path } from 'react-native-svg';

// The website's heart (lucide "heart", ISC license), drawn rather than taken
// from the symbol font, so it can be filled on Android too.
const HEART =
  'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5';

type HeartIconProps = {
  size: number;
  stroke: string;
  // Omit for an outline.
  fill?: string;
  strokeWidth?: number;
};

export function HeartIcon({ size, stroke, fill = 'none', strokeWidth = 2 }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={HEART}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
