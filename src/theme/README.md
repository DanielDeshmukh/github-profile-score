# Theme Tokens

Centralized color palette for all SVG/HTML renderers in this project.

## Palette

| Token           | Hex / Value             | Usage                                    |
|-----------------|-------------------------|------------------------------------------|
| `bg`            | `#0d1117`               | Card backgrounds                         |
| `bgCard`        | `#161b22`               | Inner card surfaces                      |
| `border`        | `rgba(48, 54, 61, 0.8)` | Card borders, dividers                   |
| `borderAccent`  | `rgba(88, 166, 255, 0.2)` | Accent borders                        |
| `textPrimary`   | `#e6edf3`               | Headings, big numbers                    |
| `textMuted`     | `#8b949e`               | Labels, secondary text                   |
| `blue`          | `#58a6ff`               | Primary accent (streaks, rings)          |
| `purple`        | `#a371f7`               | Secondary accent (grade ring)            |
| `green`         | `#3fb950`               | Positive trend, contributions            |
| `orange`        | `#f0883e`               | Warnings, highlights                     |
| `red`           | `#f85149`               | Errors, declining trend                  |
| `gold`          | `#e3b341`               | Stars, special values                    |

## Derived Values

| Token             | Value                      | Usage                                    |
|-------------------|----------------------------|------------------------------------------|
| `goldTransparent` | `rgba(88, 166, 255, 0.15)` | Ring track backgrounds, subtle glow      |
| `charcoalDeep`    | `#0d1117`                  | Deepest background layer                 |
| `textMuted`       | `#8b949e`                  | Footer text, timestamps                  |
| `barTrack`        | `#21262d`                  | Progress bar background tracks           |

## Legacy Aliases

The `THEME` export provides backward-compatible aliases mapped to the new palette:

```ts
THEME.charcoal  → tokens.bg
THEME.cream     → tokens.bg
THEME.gold      → tokens.blue
THEME.goldLight → tokens.textPrimary
THEME.slate     → tokens.border
THEME.silver    → tokens.textMuted
```

## Usage

Import from `src/theme/tokens.ts`:

```ts
import { tokens } from '../theme/tokens.js';
// or for backward compatibility:
import { THEME, THEME_DERIVED } from '../theme/tokens.js';
```

All renderers should use `tokens` for new code. The `THEME` aliases are
maintained for existing renderers during the migration period.
