/**
 * Basket theme.
 *
 * The colours, radius and spacing come straight from design/tokens.json,
 * the same file the Figma design was made from. Change a colour there and
 * the whole app follows.
 */
import tokens from '../../design/tokens.json';

export const colors = tokens.color;

// Each weight of Inter is loaded as its own font family (see src/app/_layout.tsx).
// On Android, picking the family is more reliable than setting fontWeight.
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const radius = tokens.radius;

// space[0] = 4, space[1] = 8, space[2] = 12, space[3] = 16, space[4] = 20, space[5] = 24, space[6] = 32
export const space = tokens.space;

export const layout = tokens.layout;

// Text styles, matching the type scale on the Figma token sheet.
export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
} as const;
