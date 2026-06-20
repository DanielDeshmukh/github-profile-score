# Task: Pixel-perfect redesign of all github-profile-score SVG cards

## Context
The current SVG renderers (src/renderer/*.ts) produce cluttered cards: uniform
progress-bar rows with no visual hierarchy, duplicated data across cards (the
contribution heatmap appears on both the contributions card AND the overview card),
and a profile picture avatar that requires an extra fetch and fails ugly when missing.

This task replaces the visual design across ALL card-producing renderers with the
exact spec below. Treat every pixel value, color, and coordinate in this prompt as
fixed — do not improvise spacing, do not "improve" the layout, do not substitute
different colors. If something is ambiguous, follow the closest analogous spec already
given rather than inventing a new pattern.

## Design tokens (use these exact hex values — do not use CSS variables, this is
## server-rendered SVG with no host stylesheet)

| Token | Hex | Usage |
|-------|-----|-------|
| bg | #0d1117 | card background |
| bgTile | #161b22 | metric tile / inner surface fill |
| bgTileWarn | #2d1f12 | metric tile fill when flagging a weak/low value |
| textPrimary | #e6edf3 | headings, big numbers |
| textSecondary | #8b949e | labels, muted text |
| textTertiary | #6e7681 | timestamps, footnotes |
| border | #30363d | card border, dividers (use stroke-width 0.5, opacity handled via this hex not rgba) |
| accentBlue | #58a6ff | links, primary accent |
| accentGreen | #3fb950 | positive values, streaks, contribution activity |
| accentAmber | #d29922 | warning tile text/border (low score, weak dimension) |
| accentGold | #e3b341 | stars |
| accentPurple | #a371f7 | secondary accent if needed |
| langPython | #3572A5 | language bar segment |
| langJS | #f1e05a | language bar segment |
| langTS | #3178c6 | language bar segment |

Font: `font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"` on
every `<text>` element — no webfont dependency, no Tabler icon font (server-rendered
SVG can't guarantee webfont load on every embedding client/email/IDE preview). All
icons must be hand-drawn inline `<path>`/`<circle>` primitives, not icon-font glyphs.

Text weight: use `font-weight="500"` for headings/numbers, `font-weight="400"` for
labels — never 600/700, never bold tags.

Sentence case on all labels, no ALL CAPS, no Title Case headers.

## Avatar: initials, not profile picture

Replace every avatar fetch/render with an initials circle:
- Circle: `r="18"`, fill `#1f2937` if a per-user color isn't computed, OR derive a
  deterministic fill by hashing the username to pick from
  [accentBlue, accentGreen, accentPurple, accentGold] (same hash function used
  consistently across all card renderers so the same user gets the same color on
  every card).
- Initials: first 1-2 letters of the username, uppercased, centered in the circle.
  `font-size="14"`, `font-weight="500"`, fill = a readable text color against the
  chosen background (use #0d1117 if the background is light/accentGold, otherwise
  #e6edf3).
- Compute initials as: if username contains no separators, take first 2 chars
  uppercased. (e.g. "octocat" → "OC", "DanielDeshmukh" → "DA" — first 2 chars only,
  do not try to detect word boundaries in a single camelCase string — keep this rule
  simple and deterministic.)
- This removes the avatar HTTP fetch entirely — delete any avatar-image-fetching code
  path from the affected renderers and the corresponding fetcher calls, but do NOT
  remove `profile.avatarUrl` from the data model itself in case other code depends on
  it; just stop using it for rendering these cards.

## Shared components (reuse identical markup across all cards that need them)

### Metric tile
A `<rect>` w/h variable, fill `bgTile` (or `bgTileWarn` if flagging), `rx="6"`, no
stroke. Contains two `<text>` elements: label at top (`font-size="11"`, fill
`textSecondary`, or `accentAmber` if warn-flagged), value below
(`font-size="16"` weight 500, fill `textPrimary`, or `accentAmber` if warn-flagged).
Value text may have a smaller trailing "/20" or unit suffix at `font-size="11"` fill
`textTertiary` (or `accentAmber` at reduced opacity equivalent — use `textTertiary`
hex regardless of tile state to keep the suffix unobtrusive).

### Language bar
Single `<rect>` row, height 8, rx 4, built from N consecutive `<rect>` segments (no
gaps) each `width = percentage * total_bar_width`, fills from the langPython/langJS/
langTS table above (extend the table with additional language colors as needed,
following GitHub's standard per-language color — do not invent colors for known
languages, look up GitHub's linguist color list if a language isn't in the table
above). Below the bar: a legend row of small `circle r="3.5"` + label `text` pairs,
one per language, `font-size="11"` fill `textSecondary`.

### Sparkline strip (replaces calendar heatmap grid)
12 (or N) consecutive `<rect>` segments, each `rx="2"`, gap 3px between, fill
`accentGreen` at varying opacity (`fill-opacity` attribute, not rgba) representing
relative activity level that week — 0 activity uses fill `bgTile` instead of green.
Compute opacity tiers from the real data: bucket into 5 levels
(0, 0.35, 0.6, 0.8, 1.0) by quantile of the week's contribution count relative to the
max week in the dataset.

### Hand-drawn icons (inline path primitives — exact paths below, do not substitute)
Flame icon (streak), 16x16 viewBox, stroke `currentColor` (set via parent `<g
fill="none" stroke="{textSecondary}" stroke-width="1.5">`):
`<path d="M8 1c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-1-2-1-3 2 1 3 3 3 5a4 4 0 0 1-8 0c0-4 3-5 4-9z"/>`

Trophy icon (longest streak), 16x16 viewBox, same stroke style:
`<path d="M4 2h8v3a4 4 0 0 1-8 0V2z"/><path d="M4 3H2v1a3 3 0 0 0 3 3M12 3h2v1a3 3 0 0 1-3 3"/><path d="M8 9v3M5 14h6M6 12h4v2H6z"/>`

Use these two icons only where specified per-card below. Do not add icons to cards
that didn't have one specified.

## Per-card specs

### 1. Score badge (`/score/:username.svg`) — 480x200 (reduced from 480x260, no
longer needs room for 5 stacked progress bars)

Layout, top to bottom:
- y=20: initials avatar circle (cx=38, cy=38, r=18) + `@username` text at x=66 y=34
  (font-size 14, weight 500, fill textPrimary) + "Job readiness score" subtitle at
  x=66 y=50 (font-size 11, fill textTertiary)
- Top-right: big score number, right-aligned at x=440, y=40 baseline, font-size 28
  weight 500, fill accentGreen if score≥70, fill textPrimary if 40-69, fill
  accentAmber if <40. Directly below it, right-aligned, "grade {LETTER}" font-size 11
  fill textTertiary.
- y=80 to y=160: 2x2 grid of metric tiles, each 210x52, gap 10px between
  (x positions: 30 and 250; y positions: 80 and 142). Show 4 of the 5 scoring
  dimensions — the 4 highest-scoring. The 5th (lowest-scoring) dimension does NOT get
  a tile; instead:
- y=176: footer row — left side: "Lowest: {dimension name}, {score}/20" font-size 11
  fill textTertiary (using accentAmber fill if that score is <10). Right side,
  right-aligned: "Scored on {date}" font-size 11 fill textTertiary.

This mirrors the HTML mockup shown earlier exactly: hero number top-right, 4 tiles in
a grid, weakest dimension demoted to a footer callout instead of a 5th tile.

### 2. Contributions card (`/stats/:username/contributions.svg`) — 480x180

- y=20: "{total}" big number, font-size 24 weight 500, fill textPrimary, x=30
  baseline y=36. Same line, right-aligned at x=450: date range, font-size 11 fill
  textTertiary.
- y=44: "Contributions" label, font-size 12, fill textSecondary, x=30.
- y=64 to y=104: two metric tiles side by side, each 210x40, x=30 and x=250.
  Tile 1: flame icon (x=42,y=72, 16x16) + "{streak} days" font-size 14 weight 500 at
  x=64 y=84, + "current streak" font-size 10 fill textTertiary at x=64 y=96.
  Tile 2: trophy icon + "{longest} days" / "longest streak", same layout, x offset
  +220.
- y=120: "Last 12 weeks" label, font-size 10 fill textTertiary, x=30.
- y=130 to y=150: sparkline strip, 12 segments, x=30 to x=450, height 20.

### 3. Overview card (`/stats/:username/overview.svg`) — 480x180

- y=20: "{username}'s GitHub stats" font-size 12 fill textSecondary, x=30.
- y=40 to y=80: 3-column stat row (stars / commits-last-year / PRs), each column
  ~140px wide starting x=30,170,310. Each column: big number font-size 18 weight 500
  fill textPrimary at top, label font-size 10 fill textTertiary below.
- y=100: divider line, full width x=30 to x=450, stroke border, stroke-width 0.5.
- y=116: "Top languages" label, font-size 10 fill textTertiary, x=30.
- y=128 to y=136: language bar, x=30 to x=450, height 8.
- y=150 to y=168: language legend row, wrapping if needed, x=30 start.

Do NOT include a contribution calendar on this card — that data lives exclusively on
the contributions card now; this card must not duplicate it.

### 4. Languages card (`/stats/:username/languages.svg`) — 480x180
Standalone version of the language bar + legend from the overview card, but with full
byte-count detail since it has the whole card to itself:
- y=20: "Languages" font-size 12 fill textSecondary, x=30.
- y=36 to y=44: language bar, x=30 to x=450, height 8.
- y=60 onward: one row per language (up to 6, then "+N more" footer row), each row:
  circle swatch + name (font-size 12 fill textPrimary) left-aligned, percentage
  (font-size 12 fill textSecondary) right-aligned at x=420, byte count (font-size 10
  fill textTertiary) right-aligned at x=450. Row height 22px.

### 5. Insight widgets (320x80, or 320x100 for commit-pattern) — apply the SAME
visual language even though these are small: initials are not used here (no per-user
avatar on these), but use the same metric-tile background, same font stack, same
icon style if an icon is specified in the existing implementation (e.g. star icon for
most-starred-repo — hand-draw it in the same stroke style as the flame/trophy icons
above, do not use a filled star glyph). Keep existing field data and copy exactly as
documented in the README — this redesign changes color/spacing/typography consistency
only for these 8 small cards, not their information content. Specifically:
- Background: bg (#0d1117), border (#30363d) 0.5px stroke, rx 6.
- Title label top-left: font-size 10, fill textTertiary, sentence case (e.g.
  "Most active repo" not "MOST ACTIVE REPO" as currently rendered — this is a
  required change, the current implementation is ALL CAPS and must become sentence
  case to match the rest of the redesign).
- Main value: font-size 16 weight 500 fill textPrimary.
- Any bar indicator (activity bar, star bar, duration bar): height 4, rx 2, fill
  accentBlue at fill-opacity matching relative magnitude, track fill bgTile.

### Error/fallback states (the "No public repos found" cards, rate-limit card,
not-found card)
Apply the same dark background/border/font treatment. Keep these informational, not
alarming — use textSecondary for the message text, NOT accentAmber/red, since "no
public repos" is a neutral data state, not an error. Reserve red/amber styling
exclusively for the actual error-handler SVG fallback (already implemented in
errorHandler.ts from the prior bug-fix round) — do not change that one, it's correct
as-is with its red accent for genuine failures.

## Implementation requirements
- Update every file under src/renderer/ (SvgRenderer.ts, ContributionsCardRenderer.ts,
  StatsCardRenderer.ts, and each file under src/renderer/insights/) to match this spec.
- Add a shared src/renderer/shared/avatar.ts exporting a renderInitialsAvatar(username,
  cx, cy, r) function per the avatar spec above — use it everywhere an avatar
  previously appeared, do not duplicate the initials/hash logic per-file.
- Add a shared src/renderer/shared/tile.ts exporting a renderMetricTile(...) helper
  used by every card with metric tiles, so the tile markup is generated identically
  everywhere rather than hand-copied per renderer.
- Remove now-unused avatar-fetching code paths (e.g. any GitHub avatar URL fetch used
  purely for rendering these cards) but leave profile.avatarUrl in the data model.
- Update the height attribute on the root <svg> for each card to match the new
  dimensions specified above (the badge shrinks from 260 to 200, contributions/
  overview/languages stay at 180 from prior 200, adjust if existing height differs).
- Run npm test and npm run lint after changes. Existing renderer tests will need their
  snapshot/assertions updated to match new markup — update them deliberately (verify
  each new assertion matches this spec) rather than blindly accepting whatever the
  new output happens to produce.
- Do NOT change any of the three bug fixes from the previous PR (cache TTL, error
  handler content-type detection, Cache-Control headers) — this is a pure visual
  layer change on top of that already-fixed logic.

## Deliverable
After implementation, generate actual rendered SVG output locally for each of the 5
card types plus 2 representative insight widgets (most-starred-repo, account-age)
using the DanielDeshmukh test account, and save them as static files under
templates-v2/ in the repo root (mirroring the existing templates/ folder structure)
so they can be visually reviewed without running the server.

Write a short report-design.md summarizing:
- Every file changed
- Confirmation each card's pixel dimensions match this spec exactly
- Confirmation the avatar fetch code path was removed and initials render correctly
  for at least 2 different usernames (showing the deterministic color hash differs
  between them)
- Test/lint pass status
- A note on any spec ambiguity encountered and the judgment call made to resolve it
  (there should be very few — this spec is meant to be unambiguous)