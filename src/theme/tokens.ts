export const tokens = {
  bg:          '#0d1117',
  bgCard:      '#161b22',
  border:      'rgba(48, 54, 61, 0.8)',
  borderAccent:'rgba(88, 166, 255, 0.2)',
  textPrimary: '#e6edf3',
  textMuted:   '#8b949e',
  blue:        '#58a6ff',
  purple:      '#a371f7',
  green:       '#3fb950',
  orange:      '#f0883e',
  red:         '#f85149',
  gold:        '#e3b341',
} as const;

export const THEME = {
  charcoal: tokens.bg,
  cream: tokens.bg,
  gold: tokens.blue,
  goldLight: tokens.textPrimary,
  slate: tokens.border,
  silver: tokens.textMuted,
} as const;

export const THEME_DERIVED = {
  goldTransparent: 'rgba(88, 166, 255, 0.15)',
  charcoalDeep: tokens.bg,
  textMuted: tokens.textMuted,
  barTrack: '#21262d',
} as const;

export type ThemeToken = (typeof THEME)[keyof typeof THEME];
export type DerivedToken = (typeof THEME_DERIVED)[keyof typeof THEME_DERIVED];
