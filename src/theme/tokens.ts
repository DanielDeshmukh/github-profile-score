export const THEME = {
  charcoal: '#1a1a1a',
  cream: '#111315',
  gold: '#c9a962',
  goldLight: '#e8d5a3',
  slate: '#2d3748',
  silver: '#7d8a96',
} as const;

export const THEME_DERIVED = {
  goldTransparent: 'rgba(201, 169, 98, 0.15)',
  charcoalDeep: '#0d0f11',
  textMuted: '#4a5568',
  barTrack: '#1e2229',
} as const;

export type ThemeToken = (typeof THEME)[keyof typeof THEME];
export type DerivedToken = (typeof THEME_DERIVED)[keyof typeof THEME_DERIVED];
