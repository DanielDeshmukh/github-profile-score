# Theme Tokens

Centralized color palette for all SVG/HTML renderers in this project.

## Palette

| Token          | Hex       | Usage                                    |
|----------------|-----------|------------------------------------------|
| `cream`        | `#111315` | Card backgrounds, primary surface        |
| `charcoal`     | `#1a1a1a` | Secondary backgrounds, panel fills       |
| `gold`         | `#c9a962` | Accent ring, highlights, active strokes  |
| `goldLight`    | `#e8d5a3` | Primary text, large numbers, headings    |
| `slate`        | `#2d3748` | Borders, dividers, ring track backgrounds |
| `silver`       | `#7d8a96` | Secondary text, labels, subtitles        |

## Derived Values

| Token             | Value                    | Usage                                    |
|-------------------|--------------------------|------------------------------------------|
| `goldTransparent` | `rgba(201,169,98,0.15)` | Ring track backgrounds, subtle glow      |
| `charcoalDeep`    | `#0d0f11`               | Deepest background layer                 |
| `textMuted`       | `#4a5568`               | Footer text, timestamps                  |
| `barTrack`        | `#1e2229`               | Progress bar background tracks           |

## Usage

Import from `src/theme/tokens.ts`:

```ts
import { THEME, THEME_DERIVED } from '../theme/tokens.js';
```

All new renderers should reference these tokens instead of hardcoding hex
values. The existing score badge renderer (`SvgRenderer.ts`) already uses
the same values but hardcoded — it can be migrated later without changing
visual output.
