export const Colors = {
  primary: '#141759',
  secondary: '#54578C',
  accentPrimary: '#D9A91A',
  accentSecondary: '#F2D194',
  backgroundLight: '#F2F2F2',
} as const;

export type ColorName = keyof typeof Colors;
