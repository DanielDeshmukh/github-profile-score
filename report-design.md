# Design Report — github-profile-score SVG Card Redesign

## Files Changed

### Core renderers (visual changes)
| File | Phase | Changes |
|------|-------|---------|
| `src/theme/tokens.ts` | 1 | Updated token hex values to match DESIGN_RULES.md |
| `src/renderer/shared/avatar.ts` | 1 | New: initials avatar with deterministic color hash |
| `src/renderer/shared/tile.ts` | 1 | New: reusable metric tile helper |
| `src/renderer/shared/icons.ts` | 1 | New: hand-drawn flame, trophy, star inline SVGs |
| `src/renderer/shared/sparkline.ts` | 1 | New: 12-segment activity strip with opacity tiers |
| `src/renderer/SvgRenderer.ts` | 2 | 480x200 score badge, initials avatar, 2x2 tile grid |
| `src/renderer/ContributionsCardRenderer.ts` | 3 | 480x180, flame/trophy streak tiles, sparkline |
| `src/renderer/StatsCardRenderer.ts` | 4 | 480x180 overview + languages, 3-column stats, language bar |
| `src/renderer/insights/AccountAgeCard.ts` | 6 | Sentence case, border stroke, font-weight 500 |
| `src/renderer/insights/AvgCommitsPerRepoCard.ts` | 6 | Same visual refresh |
| `src/renderer/insights/CommitPatternCard.ts` | 6 | Same visual refresh (320x100) |
| `src/renderer/insights/CommitsPerTenureCard.ts` | 6 | Same visual refresh |
| `src/renderer/insights/ContributionTrendCard.ts` | 6 | Same visual refresh |
| `src/renderer/insights/LongestMaintainedRepoCard.ts` | 6 | Same visual refresh |
| `src/renderer/insights/MostActiveRepoCard.ts` | 6 | Same visual refresh |
| `src/renderer/insights/MostStarredRepoCard.ts` | 6 | Same visual refresh + hand-drawn star icon |

### Cleanup
| File | Phase | Changes |
|------|-------|---------|
| `src/renderer/shared/ring.ts` | 7 | Deleted (unused dead code) |
| `src/routes/stats.ts` | 4 | Fixed languages endpoint bug |

### Tests updated
| File | Phase | Changes |
|------|-------|---------|
| `tests/stats-card.test.ts` | 4 | Updated assertions for new markup |
| `tests/contributions-card.test.ts` | 3 | Updated assertions for new markup |
| `tests/insights/account-age-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/avg-commits-per-repo-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/commit-pattern-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/commits-per-tenure-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/contribution-trend-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/longest-maintained-repo-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/most-active-repo-card.test.ts` | 6 | tokens instead of THEME |
| `tests/insights/most-starred-repo-card.test.ts` | 6 | tokens instead of THEME |

## Dimension Verification

| Card | Spec Width | Spec Height | Actual Width | Actual Height | Match |
|------|-----------|-------------|-------------|---------------|-------|
| Score badge | 480 | 200 | 480 | 200 | Yes |
| Contributions | 480 | 180 | 480 | 180 | Yes |
| Overview | 480 | 180 | 480 | 180 | Yes |
| Languages | 480 | 180 | 480 | 180 | Yes |
| Insight widgets | 320 | 80 | 320 | 80 | Yes |
| Commit pattern | 320 | 100 | 320 | 100 | Yes |

## Avatar Verification

- Initials avatar renders correctly for "DanielDeshmukh" → "DA" with purple (#a371f7) background
- Initials avatar renders correctly for "octocat" → "OC" with different color (deterministic hash)
- No server-side avatar fetch code paths remain in SVG renderers
- `avatar_url` field left in data model per spec

## Test/Lint Status

- `npm run typecheck`: passes
- `npm run lint`: passes
- `npm run test`: all tests pass except pre-existing `ratelimit.test.ts` timeout (5000ms, unrelated to redesign)

## Spec Ambiguities Resolved

1. **Token naming**: `bgCard` renamed to `tokens.bgTile` to better describe its用途 (tile/card backgrounds). Kept `textMuted` alias for backward compatibility.
2. **Phase 4+5 combined**: `renderStatsCard` and `renderLanguagesCard` share `StatsCardRenderer.ts`, so phases were merged into a single commit.
3. **Insight card icon removal**: Removed left accent stripe icons from insight cards per spec ("use the same metric-tile background"). The hand-drawn star icon was kept on MostStarredRepoCard as explicitly required by spec.
4. **Font-weight**: Changed from 600/700 to 500 throughout per spec requirement.
