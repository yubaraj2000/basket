import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Line icons drawn with SVG paths (from the open-source Lucide icon set),
 * the same ones used in the Figma design. Each icon is a list of path strings
 * on a 24 × 24 grid.
 */
const ICONS = {
  basket: [
    'm15 11-1 9',
    'm19 11-4-7',
    'M2 11h20',
    'm3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4',
    'M4.5 15.5h15',
    'm5 11 4-7',
    'm9 11 1 9',
  ],
  link: [
    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
    'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  ],
  back: ['m12 19-7-7 7-7', 'M19 12H5'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  check: ['M20 6 9 17l-5-5'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  chevronDown: ['m6 9 6 6 6-6'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  mic: [
    'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z',
    'M19 10v2a7 7 0 0 1-14 0v-2',
    'M12 19v3',
  ],
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {ICONS[name].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
