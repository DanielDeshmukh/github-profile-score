export const tokens = {
  bg:          '#0d1117',
  bgTile:      '#161b22',
  bgTileWarn:  '#2d1f12',
  border:      '#30363d',
  textPrimary: '#e6edf3',
  textSecondary:'#8b949e',
  textMuted:   '#8b949e',
  textTertiary:'#6e7681',
  blue:        '#58a6ff',
  purple:      '#a371f7',
  green:       '#3fb950',
  amber:       '#d29922',
  orange:      '#f0883e',
  red:         '#f85149',
  gold:        '#e3b341',
  langPython:  '#3572A5',
  langJS:      '#f1e05a',
  langTS:      '#3178c6',
} as const;

export const THEME = {
  charcoal: tokens.bg,
  cream: tokens.bg,
  gold: tokens.blue,
  goldLight: tokens.textPrimary,
  slate: tokens.border,
  silver: tokens.textSecondary,
} as const;

export const THEME_DERIVED = {
  goldTransparent: 'rgba(88, 166, 255, 0.15)',
  charcoalDeep: tokens.bg,
  textMuted: tokens.textSecondary,
  barTrack: '#21262d',
} as const;

export type ThemeToken = (typeof THEME)[keyof typeof THEME];
export type DerivedToken = (typeof THEME_DERIVED)[keyof typeof THEME_DERIVED];
