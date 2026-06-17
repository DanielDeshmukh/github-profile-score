<div align="center">

# github-profile-score

**An embeddable job-readiness scorer for GitHub profiles — powered by heuristics + AI callouts**

If this project saves you time, consider giving it a star. It helps others find it.

[![Star this repo](https://img.shields.io/github/stars/DanielDeshmukh/github-profile-score?style=social)](https://github.com/DanielDeshmukh/github-profile-score)

[![CI](https://github.com/DanielDeshmukh/github-profile-score/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielDeshmukh/github-profile-score/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-93%2B-brightgreen)](https://vitest.dev/)

Drop a badge into any README and let your GitHub profile speak for itself.

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME)
```

</div>

---

## Table of Contents

- [What Is This?](#what-is-this)
- [Quick Deploy](#quick-deploy)
- [Scoring Dimensions](#scoring-dimensions)
- [API Endpoints](#api-endpoints)
  - [Score Badge](#score-badge-endpoints)
  - [Stats Cards](#stats-card-endpoints)
  - [Insight Widgets](#insight-widget-endpoints)
  - [Health Check](#health-endpoint)
- [Embedding Guide](#embedding-guide)
- [Theming](#theming)
- [Architecture](#architecture)
- [Getting Started](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Caching Strategy](#caching-strategy)
- [Contributing](#contributing)
- [License](#license)

---

## What Is This?

`github-profile-score` analyzes a GitHub profile across five hiring-signal dimensions and produces:

- **A live SVG badge** you embed directly in your README (`/score/{username}.svg`)
- **Stats cards** showing contributions, streaks, and language breakdown
- **Insight widgets** revealing activity patterns, repo health, and account metrics
- **A detailed HTML breakdown** with dimension scores and AI-written fix callouts
- **A shareable permalink** for your portfolio or job applications

The scoring is intentionally transparent — no black box. Raw scores are calculated from GitHub API data using documented heuristics. NVIDIA NIM (free tier, optional) then interprets those scores into human-readable "what to fix" notes.

---

## Visual Templates

All SVG card outputs are available as static templates in the [`templates/`](./templates/) directory. Open them in a browser to see exactly what each card looks like.

### Score & Stats Cards

| Card | Preview File | Dimensions |
|------|-------------|------------|
| Score Badge | [`01-score-badge.svg`](./templates/01-score-badge.svg) | 480×260 |
| Contributions Card | [`02-contributions-card.svg`](./templates/02-contributions-card.svg) | 480×200 |
| Overview Card | [`03-overview-card.svg`](./templates/03-overview-card.svg) | 480×200 |
| Languages Card | [`04-languages-card.svg`](./templates/04-languages-card.svg) | 480×200 |

### Insight Widgets

| Widget | Preview File | Dimensions |
|--------|-------------|------------|
| Most Active Repo | [`05-insight-most-active-repo.svg`](./templates/05-insight-most-active-repo.svg) | 320×80 |
| Account Age | [`06-insight-account-age.svg`](./templates/06-insight-account-age.svg) | 320×80 |
| Most Starred Repo | [`07-insight-most-starred-repo.svg`](./templates/07-insight-most-starred-repo.svg) | 320×80 |
| Contribution Trend | [`08-insight-contribution-trend.svg`](./templates/08-insight-contribution-trend.svg) | 320×80 |
| Avg Commits per Repo | [`09-insight-avg-commits-per-repo.svg`](./templates/09-insight-avg-commits-per-repo.svg) | 320×80 |
| Longest-Maintained Repo | [`10-insight-longest-maintained-repo.svg`](./templates/10-insight-longest-maintained-repo.svg) | 320×80 |
| Commit Pattern | [`11-insight-commit-pattern.svg`](./templates/11-insight-commit-pattern.svg) | 320×100 |
| Commits per Tenure | [`12-insight-commits-per-tenure.svg`](./templates/12-insight-commits-per-tenure.svg) | 320×80 |

### Error States

| Error | Preview File |
|-------|-------------|
| Rate Limit | [`13-error-rate-limit.svg`](./templates/13-error-rate-limit.svg) |
| User Not Found | [`14-error-user-not-found.svg`](./templates/14-error-user-not-found.svg) |

---

## Quick Deploy (Fork & Go)

Deploy in under 5 minutes — no cloning required.

1. **Fork** this repo
2. **Deploy** using one of the buttons below
3. **Add** your `GITHUB_TOKEN` environment variable
4. **Copy** the badge URL to your profile README

| Platform | Deploy Button |
|----------|---------------|
| **Railway** | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https://github.com/DanielDeshmukh/github-profile-score) |
| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/DanielDeshmukh/github-profile-score) |

> **Note:** `NVIDIA_API_KEY` is optional. Without it, you'll get generic improvement suggestions instead of AI-personalized ones.

---

## Scoring Dimensions

Each dimension scores **0–20 points** (total: 100).

| Dimension | What's Measured | Key Signals |
|-----------|----------------|-------------|
| **Activity** | Consistency of contributions | Commit frequency, streak length, recency of pushes |
| **Project Quality** | Are repos worth looking at? | Stars, forks, watchers, presence of topics/description |
| **Documentation** | Can someone understand your work? | README presence & length, wiki usage, GitHub Pages |
| **Tech Diversity** | Breadth of stack | Language count, repo type spread (lib vs app vs tool) |
| **Community** | Collaboration signals | PRs to others, issues filed, org membership, followers:following ratio |

> **Raw scores are heuristic — no LLM involved.** NVIDIA NIM only writes the "fix callout" text for dimensions that score below threshold. This keeps latency low and costs zero.

---

## API Endpoints

### Score Badge Endpoints

#### `GET /score/:username.svg`

Returns the embeddable SVG job-readiness badge. This is the **primary embed URL** for README badges.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `refresh` | `?refresh=1` | Bust the cache and re-score (rate-limited to 1 refresh per 10 min per username) |

**Response Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `image/svg+xml` |
| `Cache-Control` | `public, max-age=3600, s-maxage=3600` |
| `ETag` | `"<total>-<scored_at>"` |

**SVG Output:**

The badge renders a 480×260 card with:
- User avatar and `@username`
- Circular grade ring (A–F) with numeric score
- 5 dimension progress bars (Activity, Quality, Documentation, Diversity, Community)
- Scored-on date footer

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="260" viewBox="0 0 480 260">
  <rect width="480" height="260" fill="#111315" rx="12"/>
  <rect width="480" height="2" fill="#c9a962" rx="0"/>

  <!-- Avatar -->
  <rect x="28" y="22" width="44" height="44" rx="22" fill="#1e2229" stroke="#c9a962" stroke-width="1"/>
  <image href="https://github.com/octocat.png?size=48" x="28" y="22" width="44" height="44"/>
  <text x="64" y="34" font-size="15" fill="#e8d5a3" font-weight="600">@octocat</text>
  <text x="64" y="50" font-size="11" fill="#7d8a96">GitHub Profile Score</text>

  <!-- Grade Ring -->
  <circle cx="432" cy="44" r="30" fill="none" stroke="#c9a962" stroke-width="6" .../>
  <text x="432" y="40" font-size="18" fill="#e8d5a3" text-anchor="middle" font-weight="700">74</text>
  <text x="432" y="56" font-size="11" fill="#c9a962" text-anchor="middle">B</text>

  <!-- Dimension Bars -->
  <text x="24" y="96" font-size="11" fill="#7d8a96">Activity</text>
  <text x="456" y="96" font-size="11" fill="#e8d5a3" text-anchor="end">16/20</text>
  <rect x="24" y="102" width="328" height="4" rx="2" fill="#c9a962"/>
  <!-- ... 4 more dimension bars ... -->

  <rect y="258" width="480" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**Error Responses:**

| Status | Condition | SVG |
|--------|-----------|-----|
| `404` | User not found | "User Not Found" card |
| `429` | Rate limited | "Rate limited — retry after HH:MM UTC" card |

---

#### `GET /score/:username`

Returns the full JSON score payload.

**Response:**

```json
{
  "username": "octocat",
  "total": 74,
  "grade": "B",
  "dimensions": {
    "activity":      { "score": 16, "max": 20, "callout": null },
    "quality":       { "score": 14, "max": 20, "callout": null },
    "documentation": { "score": 11, "max": 20, "callout": "Your documentation score is low. Use readme-craft to generate a production-ready README." },
    "diversity":     { "score": 18, "max": 20, "callout": null },
    "community":     { "score": 15, "max": 20, "callout": null }
  },
  "cached": true,
  "cache_age_seconds": 1820
}
```

---

#### `GET /score/:username/html`

Full HTML report with dimension breakdown, fix callouts, and comparison percentiles. Opens in browser — not embeddable in README.

---

#### `GET /score/:username/plan`

Returns a prioritized improvement plan sorted by points available. Dimensions where score equals max are omitted.

**Response:**

```json
{
  "username": "octocat",
  "total": 74,
  "grade": "B",
  "improvements": [
    {
      "dimension": "documentation",
      "current_score": 11,
      "max_score": 20,
      "points_available": 9,
      "callout": "Your documentation score is low.",
      "priority": 1
    }
  ]
}
```

---

### Stats Card Endpoints

Stats cards use a gold/charcoal theme and are **independent** from the score badge — separate caching, refresh cycles, and API calls.

#### `GET /stats/:username/contributions.svg`

Returns the contributions/streak SVG card showing total contributions, current streak with progress ring, and longest streak.

**SVG Output:**

The card renders a 480×200 three-column layout:
- **Column 1:** Total Contributions count + date range
- **Column 2:** Current Streak as circular progress ring (current/longest ratio)
- **Column 3:** Longest Streak count + date range

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200" viewBox="0 0 480 200">
  <rect width="480" height="200" fill="#111315" rx="12"/>
  <rect width="480" height="2" fill="#c9a962" rx="0"/>
  <text x="240" y="28" font-size="12" fill="#7d8a96" text-anchor="middle">CONTRIBUTIONS</text>

  <!-- Column 1: Total -->
  <text x="168" y="55" font-size="11" fill="#7d8a96" text-anchor="middle">Total Contributions</text>
  <text x="168" y="95" font-size="32" fill="#e8d5a3" text-anchor="middle" font-weight="700">500</text>
  <text x="168" y="115" font-size="10" fill="#7d8a96" text-anchor="middle">Jan 1, 2024 - Dec 31, 2024</text>

  <!-- Column 2: Streak Ring -->
  <circle cx="320" cy="85" r="28" fill="none" stroke="#c9a962" stroke-width="5" .../>
  <text x="320" y="81" font-size="22" fill="#e8d5a3" text-anchor="middle" font-weight="700">15</text>
  <text x="320" y="99" font-size="9" fill="#7d8a96" text-anchor="middle">day streak</text>

  <!-- Column 3: Longest -->
  <text x="472" y="55" font-size="11" fill="#7d8a96" text-anchor="middle">Longest Streak</text>
  <text x="472" y="95" font-size="32" fill="#e8d5a3" text-anchor="middle" font-weight="700">30</text>

  <rect y="198" width="480" height="2" fill="#c9a962" rx="0"/>
</svg>
```

---

#### `GET /stats/:username/overview.svg`

Returns the GitHub stats SVG card showing total stars earned, commits (last year), total PRs, total issues, and a grade ring.

**SVG Output:**

The card renders a 280×200 vertical layout:
- Header: "GitHub Stats" + `@username`
- Grade ring (top-right) with combined activity score
- Stat rows: Stars, Commits, PRs, Issues

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" viewBox="0 0 280 200">
  <rect width="280" height="200" fill="#111315" rx="12"/>
  <rect width="280" height="2" fill="#c9a962" rx="0"/>

  <text x="24" y="30" font-size="13" fill="#e8d5a3" font-weight="600">GitHub Stats</text>
  <text x="24" y="46" font-size="10" fill="#7d8a96">@octocat</text>

  <!-- Grade Ring -->
  <circle cx="240" cy="36" r="20" fill="none" stroke="#c9a962" stroke-width="4" .../>

  <text x="24" y="78" font-size="11" fill="#7d8a96">Total Stars Earned</text>
  <text x="256" y="78" font-size="13" fill="#e8d5a3" text-anchor="end" font-weight="600">150</text>

  <text x="24" y="100" font-size="11" fill="#7d8a96">Commits (Last Year)</text>
  <text x="256" y="100" font-size="13" fill="#e8d5a3" text-anchor="end" font-weight="600">420</text>

  <text x="24" y="122" font-size="11" fill="#7d8a96">Total PRs</text>
  <text x="256" y="122" font-size="13" fill="#e8d5a3" text-anchor="end" font-weight="600">35</text>

  <text x="24" y="144" font-size="11" fill="#7d8a96">Total Issues</text>
  <text x="256" y="144" font-size="13" fill="#e8d5a3" text-anchor="end" font-weight="600">12</text>

  <rect y="198" width="280" height="2" fill="#c9a962" rx="0"/>
</svg>
```

---

#### `GET /stats/:username/languages.svg`

Returns the language breakdown SVG card with a horizontal stacked bar and legend showing most-used languages by byte count.

**SVG Output:**

The card renders a 280×200 layout:
- Header: "Most Used Languages"
- Stacked horizontal bar (each language's GitHub brand color)
- 2-column legend with colored dots, language names, and percentages

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" viewBox="0 0 280 200">
  <rect width="280" height="200" fill="#111315" rx="12"/>
  <rect width="280" height="2" fill="#c9a962" rx="0"/>

  <text x="24" y="30" font-size="13" fill="#e8d5a3" font-weight="600">Most Used Languages</text>

  <!-- Stacked Bar -->
  <rect x="24" y="55" width="232" height="12" rx="2" fill="#1e2229"/>
  <rect x="24" y="55" width="105" height="12" rx="2" fill="#3178c6"/>  <!-- TypeScript 45% -->
  <rect x="129" y="55" width="58" height="12" rx="2" fill="#f1e05a"/> <!-- JavaScript 25% -->
  <!-- ... more segments ... -->

  <!-- Legend -->
  <circle cx="24" cy="82" r="4" fill="#3178c6"/>
  <text x="34" y="85" font-size="10" fill="#e8d5a3">TypeScript</text>
  <text x="134" y="85" font-size="10" fill="#7d8a96" text-anchor="end">45.2%</text>
  <!-- ... more legend items ... -->

  <rect y="198" width="280" height="2" fill="#c9a962" rx="0"/>
</svg>
```

---

#### `GET /stats/:username`

Returns the full JSON stats payload combining contributions, profile, and languages.

**Response:**

```json
{
  "username": "octocat",
  "contributions": {
    "totalContributions": 500,
    "rangeStart": "2024-01-01",
    "rangeEnd": "2024-12-31",
    "currentStreak": 15,
    "currentStreakRange": { "start": "2024-06-01", "end": "2024-06-15" },
    "longestStreak": 30,
    "longestStreakRange": { "start": "2024-01-10", "end": "2024-02-08" }
  },
  "profile": {
    "totalStarsEarned": 150,
    "totalCommitsLastYear": 420,
    "totalPRs": 35,
    "totalIssues": 12,
    "grade": "B"
  },
  "languages": [
    { "name": "TypeScript", "percent": 45.2, "color": "#3178c6" },
    { "name": "JavaScript", "percent": 25.1, "color": "#f1e05a" }
  ],
  "cached": false,
  "cache_age_seconds": 0,
  "generated_at": "2024-06-15T12:00:00.000Z"
}
```

---

### Insight Widget Endpoints

Insight widgets are individually-renderable SVG cards, each on its own route. They reveal specific activity patterns, repo health metrics, and account statistics. All use the same gold/charcoal theme as stats cards.

Each insight is available as:
- **SVG:** `GET /insights/:username/<slug>.svg`
- **JSON:** `GET /insights/:username` (additive — adds `<slug>` field to combined response)

All insight endpoints support `?refresh=1` to bust the cache.

---

#### `GET /insights/:username/most-active-repo.svg`

Shows the repository where the user has the most commits (by author, on the default branch).

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Most contributions to</text>
  <text x="16" y="50" font-size="16" fill="#e8d5a3" font-weight="600">
    <a href="https://github.com/octocat/my-project">my-project</a>
  </text>
  <text x="16" y="68" font-size="12" fill="#7d8a96">340 commits</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**JSON field:** `mostActiveRepo: { repoName, commitCount, repoUrl }`

---

#### `GET /insights/:username/account-age.svg`

Shows how long the GitHub account has existed, in years and months.

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Account age</text>
  <text x="16" y="52" font-size="20" fill="#e8d5a3" font-weight="600">5 years, 3 months</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**JSON field:** `accountAge: { years, months, createdAt }`

---

#### `GET /insights/:username/most-starred-repo.svg`

Shows the user's repository with the most GitHub stars.

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Most starred repository</text>
  <text x="16" y="50" font-size="16" fill="#e8d5a3" font-weight="600">
    <a href="https://github.com/octocat/awesome-lib">awesome-lib</a>
  </text>
  <text x="16" y="68" font-size="12" fill="#7d8a96">1,500 stars</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**JSON field:** `mostStarredRepo: { repoName, stars, repoUrl }`

---

#### `GET /insights/:username/contribution-trend.svg`

Shows year-over-year contribution change with directional arrow glyphs.

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Contribution trend</text>
  <text x="16" y="52" font-size="20" fill="#e8d5a3" font-weight="600">↑ 66.7%</text>
  <text x="16" y="68" font-size="12" fill="#7d8a96">Trending up: 200 vs 120 last year</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**Directional Arrows:**

| Symbol | Meaning |
|--------|---------|
| `↑` | Trending up (> +3% YoY) |
| `↓` | Trending down (< −3% YoY) |
| `→` | Steady (within ±3%) |

**JSON field:** `contributionTrend: { thisYearTotal, lastYearTotal, yoyPercentage, direction }`

---

#### `GET /insights/:username/avg-commits-per-repo.svg`

Shows average commits per active repository (repos with at least 1 commit).

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Avg commits per active repo</text>
  <text x="16" y="52" font-size="20" fill="#e8d5a3" font-weight="600">150.0</text>
  <text x="16" y="68" font-size="12" fill="#7d8a96">300 commits across 2 repos</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**JSON field:** `avgCommitsPerRepo: { average, activeRepos, totalCommits }`

---

#### `GET /insights/:username/longest-maintained-repo.svg`

Shows the repository with the longest span between the user's first and last commit.

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Longest maintained repo</text>
  <text x="16" y="50" font-size="16" fill="#e8d5a3" font-weight="600">
    <a href="https://github.com/octocat/legacy-app">legacy-app</a>
  </text>
  <text x="16" y="68" font-size="12" fill="#7d8a96">5y 3m (since 2019)</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**Duration Formats:**

| Span | Display |
|------|---------|
| ≥ 365 days | `Xy Ym` or `Xy` for exact years |
| ≥ 30 days | `Xm` |
| < 30 days | `Xd` |

**JSON field:** `longestMaintainedRepo: { repoName, spanDays, repoUrl, firstCommitDate, lastCommitDate }`

---

#### `GET /insights/:username/commit-pattern.svg`

Shows the user's approximate commit time-of-day and day-of-week pattern. **Labeled as approximate** — based on a 90-day sample from public events.

**SVG Output (320×100):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100" viewBox="0 0 320 100">
  <rect width="320" height="100" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="100" fill="#c9a962" rx="0"/>

  <text x="16" y="24" font-size="11" fill="#7d8a96">Commit pattern (approximate)</text>
  <text x="16" y="44" font-size="14" fill="#e8d5a3" font-weight="600">Weekdays: 80% / 20%</text>
  <text x="16" y="64" font-size="14" fill="#e8d5a3" font-weight="600">Peak: Afternoons</text>
  <text x="16" y="82" font-size="11" fill="#7d8a96">100 commits sampled (last 90 days)</text>

  <rect y="98" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**Daypart Definitions (UTC):**

| Daypart | Hours |
|---------|-------|
| Mornings | 06:00–11:59 |
| Afternoons | 12:00–17:59 |
| Evenings | 18:00–23:59 |
| Late nights | 00:00–05:59 |

**JSON field:** `commitPattern: { weekdayCount, weekendCount, dominantDayType, dominantDayPart, totalCommits }`

---

#### `GET /insights/:username/commits-per-tenure.svg`

Shows average commits per year of account tenure. Zero new API calls — pure derivation from profile age and contribution count.

**SVG Output (320×80):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="#111315" rx="8"/>
  <rect width="320" height="2" fill="#c9a962" rx="0"/>
  <rect x="0" y="0" width="3" height="80" fill="#c9a962" rx="0"/>

  <text x="16" y="28" font-size="11" fill="#7d8a96">Avg commits per year of tenure</text>
  <text x="16" y="52" font-size="20" fill="#e8d5a3" font-weight="600">100.0</text>
  <text x="16" y="68" font-size="12" fill="#7d8a96">500 commits over 5 years</text>

  <rect y="78" width="320" height="2" fill="#c9a962" rx="0"/>
</svg>
```

**JSON field:** `commitsPerTenure: { average, totalCommits, tenureYears }`

---

### Health Endpoint

#### `GET /health`

Liveness check. Returns cache status, uptime, and GitHub API rate limit remaining.

**Response:**

```json
{
  "status": "healthy",
  "uptime": 3847.2,
  "cache": { "type": "redis", "connected": true },
  "github": { "rateLimitRemaining": 4832 }
}
```

---

## Embedding Guide

### Score Badge

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME/html)
```

### Stats Cards

```markdown
![Contributions](https://YOUR_DOMAIN/stats/YOUR_USERNAME/contributions.svg)
![GitHub Stats](https://YOUR_DOMAIN/stats/YOUR_USERNAME/overview.svg)
![Languages](https://YOUR_DOMAIN/stats/YOUR_USERNAME/languages.svg)
```

### Insight Widgets

```markdown
![Most Active Repo](https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-active-repo.svg)
![Account Age](https://YOUR_DOMAIN/insights/YOUR_USERNAME/account-age.svg)
![Most Starred Repo](https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-starred-repo.svg)
![Contribution Trend](https://YOUR_DOMAIN/insights/YOUR_USERNAME/contribution-trend.svg)
![Avg Commits Per Repo](https://YOUR_DOMAIN/insights/YOUR_USERNAME/avg-commits-per-repo.svg)
![Longest Maintained](https://YOUR_DOMAIN/insights/YOUR_USERNAME/longest-maintained-repo.svg)
![Commit Pattern](https://YOUR_DOMAIN/insights/YOUR_USERNAME/commit-pattern.svg)
![Commits Per Tenure](https://YOUR_DOMAIN/insights/YOUR_USERNAME/commits-per-tenure.svg)
```

### All Cards Together

```html
<a href="https://YOUR_DOMAIN/score/YOUR_USERNAME/html">
  <img src="https://YOUR_DOMAIN/score/YOUR_USERNAME.svg" alt="GitHub Job Readiness Score" />
</a>
<a href="https://YOUR_DOMAIN/stats/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/stats/YOUR_USERNAME/contributions.svg" alt="Contributions" />
</a>
<a href="https://YOUR_DOMAIN/stats/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/stats/YOUR_USERNAME/overview.svg" alt="GitHub Stats" />
</a>
<a href="https://YOUR_DOMAIN/stats/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/stats/YOUR_USERNAME/languages.svg" alt="Languages" />
</a>
<a href="https://YOUR_DOMAIN/insights/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-active-repo.svg" alt="Most Active Repo" />
</a>
<a href="https://YOUR_DOMAIN/insights/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/insights/YOUR_USERNAME/account-age.svg" alt="Account Age" />
</a>
```

---

## Theming

All SVG cards use a consistent gold/charcoal theme. The color palette is centralized in `src/theme/tokens.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#111315` | Card backgrounds |
| `charcoal` | `#1a1a1a` | Secondary backgrounds |
| `gold` | `#c9a962` | Accent rings, highlights, borders |
| `goldLight` | `#e8d5a3` | Primary text, numbers, links |
| `slate` | `#2d3748` | Borders, dividers, ring tracks |
| `silver` | `#7d8a96` | Secondary text, labels |

**Language bar segments** preserve each language's recognizable GitHub brand color (e.g. Python blue `#3572A5`, JS yellow `#f1e05a`) — only the card chrome uses the gold/charcoal theme.

> **Note:** Custom theme overrides via query parameters are not yet supported but may be added in a future release.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                              │
│          GET /score/:username.svg  |  GET /stats/...  |  ...    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Express Router      │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐      ┌──────────────┐
                │   Redis Cache         │─────▶│  Cache Hit?  │──▶ return SVG
                │   TTL: 6 hours        │      └──────────────┘
                └──────────┬────────────┘
                           │ miss
                           ▼
                ┌───────────────────────┐
                │   GitHubFetcher       │  (REST: profile, repos, events)
                │   StatsFetcher        │  (GraphQL: contributions, languages)
                │   InsightFetchers     │  (per-insight: commit counts, spans)
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │   Scorer / Calculator │
                │   (pure functions)    │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │   NVIDIA NIM          │
                │  (score badge only)   │
                │  writes fix callouts  │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │   SVG Renderer        │
                │   (template strings)  │
                └──────────┬────────────┘
                           │
                           ▼
                      SVG Response
                  + cache write (6h TTL)
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- Docker (recommended) OR Redis locally
- GitHub Personal Access Token (for 5,000 req/hr vs 60 req/hr unauthenticated)
- NVIDIA NIM API key ([free at build.nvidia.com](https://build.nvidia.com/)) — optional

### Quick Start with Docker

```bash
git clone https://github.com/DanielDeshmukh/github-profile-score.git
cd github-profile-score
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN
docker compose up
```

### Quick Start without Docker

```bash
git clone https://github.com/DanielDeshmukh/github-profile-score.git
cd github-profile-score
npm install
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm test` | Run test suite (vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | **Yes** | — | GitHub Personal Access Token |
| `NVIDIA_API_KEY` | No | — | NVIDIA NIM API key for AI callouts |
| `REDIS_URL` | No | — | Redis connection string (empty = in-memory cache) |
| `PORT` | No | `3000` | Server port |
| `CACHE_TTL_SECONDS` | No | `21600` (6h) | Score badge cache TTL |
| `STATS_CACHE_TTL_SECONDS` | No | `21600` (6h) | Stats card cache TTL |
| `SCORE_THRESHOLD` | No | `14` | Dimensions below this get AI callouts |

---

## Project Structure

```
github-profile-score/
├── src/
│   ├── fetcher/
│   │   ├── GitHubFetcher.ts              # REST API calls (profile, repos, events)
│   │   ├── StatsFetcher.ts               # GraphQL stats (contributions, languages)
│   │   └── insights/
│   │       ├── InsightFetcher.ts          # Per-repo commit counts
│   │       ├── ContributionTrendFetcher.ts # 2-year contribution calendars
│   │       ├── LongestMaintainedFetcher.ts # First/last commit per repo
│   │       └── CommitPatternFetcher.ts    # Commit timestamps from events
│   ├── scorer/
│   │   ├── HeuristicScorer.ts            # Dimension scoring logic
│   │   ├── streak.ts                     # Contribution streak calculation
│   │   ├── dimensions/
│   │   │   ├── activity.ts
│   │   │   ├── quality.ts
│   │   │   ├── documentation.ts
│   │   │   ├── diversity.ts
│   │   │   └── community.ts
│   │   └── insights/
│   │       ├── mostActiveRepo.ts
│   │       ├── accountAge.ts
│   │       ├── mostStarredRepo.ts
│   │       ├── contributionTrend.ts
│   │       ├── avgCommitsPerRepo.ts
│   │       ├── longestMaintainedRepo.ts
│   │       ├── commitPattern.ts
│   │       └── commitsPerTenure.ts
│   ├── renderer/
│   │   ├── SvgRenderer.ts                # Score badge SVG
│   │   ├── HtmlRenderer.ts               # HTML report
│   │   ├── JsonRenderer.ts               # JSON output
│   │   ├── ContributionsCardRenderer.ts   # Contributions/streak SVG
│   │   ├── StatsCardRenderer.ts          # Stats + languages SVG
│   │   ├── shared/
│   │   │   └── ring.ts                   # Shared grade/progress ring
│   │   └── insights/
│   │       ├── MostActiveRepoCard.ts
│   │       ├── AccountAgeCard.ts
│   │       ├── MostStarredRepoCard.ts
│   │       ├── ContributionTrendCard.ts
│   │       ├── AvgCommitsPerRepoCard.ts
│   │       ├── LongestMaintainedRepoCard.ts
│   │       ├── CommitPatternCard.ts
│   │       └── CommitsPerTenureCard.ts
│   ├── routes/
│   │   ├── stats.ts                      # Stats card endpoints
│   │   └── insights/
│   │       ├── mostActiveRepo.ts
│   │       ├── accountAge.ts
│   │       ├── mostStarredRepo.ts
│   │       ├── contributionTrend.ts
│   │       ├── avgCommitsPerRepo.ts
│   │       ├── longestMaintainedRepo.ts
│   │       ├── commitPattern.ts
│   │       └── commitsPerTenure.ts
│   ├── ai/
│   │   ├── NvidiaCalloutWriter.ts        # NVIDIA NIM integration
│   │   └── fallback.ts                   # Static fallback callouts
│   ├── cache/
│   │   ├── RedisCache.ts                 # Redis wrapper + TTL
│   │   ├── MemoryCache.ts                # In-memory fallback
│   │   └── keys.ts                       # Cache key generators
│   ├── middleware/
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   ├── usernameValidator.ts
│   │   └── requestLogger.ts
│   ├── theme/
│   │   ├── tokens.ts                     # Centralized color palette
│   │   └── README.md
│   ├── types/
│   │   ├── stats.ts                      # Stats card data models
│   │   └── insights.ts                   # Insight widget data models
│   ├── utils/
│   │   ├── escapeHtml.ts
│   │   ├── errors.ts
│   │   ├── retry.ts
│   │   ├── circuitBreaker.ts
│   │   └── deduplicator.ts
│   ├── config.ts                         # Zod env schema
│   ├── logger.ts                         # Pino logger
│   ├── server.ts                         # Express app + route mounting
│   └── index.ts                          # Entry point
├── tests/
│   ├── scorer.test.ts
│   ├── streak.test.ts
│   ├── plan.test.ts
│   ├── contributions-card.test.ts
│   ├── stats-card.test.ts
│   ├── cache-keys.test.ts
│   ├── escapeHtml.test.ts
│   ├── ratelimit.test.ts
│   ├── stats-integration.test.ts
│   └── insights/
│       ├── most-active-repo*.test.ts
│       ├── account-age*.test.ts
│       ├── most-starred-repo*.test.ts
│       ├── contribution-trend*.test.ts
│       ├── avg-commits-per-repo*.test.ts
│       ├── longest-maintained-repo*.test.ts
│       ├── commit-pattern*.test.ts
│       ├── commits-per-tenure*.test.ts
│       └── insight-fetcher.test.ts
├── .env.example
├── docker-compose.yml
├── railway.json
├── render.yaml
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Caching Strategy

GitHub's authenticated rate limit is **5,000 requests/hour**. A single profile fetch costs approximately 4–6 API calls (profile, repos, events, languages). Without caching you'd exhaust your limit at ~800 unique profiles/hour.

### Cache Key Prefixes

| Prefix | Scope | TTL |
|--------|-------|-----|
| `score:` | Score badge result | 6 hours |
| `stats:v1:` | Stats card result | 6 hours |
| `github:<user>:` | Raw GitHub data | 1 hour |
| `insight:<slug>:v1:` | Insight widget result | 6 hours |
| `refresh_cooldown:` | Rate-limit refresh | 10 minutes |

Score, stats, and insight caches use **distinct key prefixes** so refreshing one does not invalidate the others.

### Response Headers

| Header | SVG Responses | JSON Responses |
|--------|--------------|----------------|
| `Cache-Control` | `public, max-age=3600, s-maxage=3600` | `public, max-age=300` |
| `ETag` | `<content-hash>` | — |

Set `Cache-Control: public, max-age=3600, s-maxage=3600` on SVG responses to let Cloudflare/Fastly cache them at the edge.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/new-dimension`
3. The scoring logic lives in `src/scorer/dimensions/` — each file exports a `score(repos, events, profile): number` function
4. Run tests: `npm test`
5. Run lint: `npm run lint`
6. Open a PR

### Code Conventions

- **ESM with `.js` extensions** in all imports (required by Node16 module resolution)
- **`noUncheckedIndexedAccess: true`** — always guard array/object index access
- **Theme tokens** from `src/theme/tokens.ts` — never hardcode colors in renderers
- **`escapeHtml`** for all user-supplied strings in SVG/HTML output
- **Shared ring helper** at `src/renderer/shared/ring.ts` — reuse for progress/grade rings
- **Cache key prefix isolation** — `score:`, `stats:v1:`, `insight:<slug>:v1:`

### Scoring Philosophy

Keep the heuristic scorer **deterministic and documentable**. If a recruiter asks "why did I score 11/20 on Documentation?", there should be a clear, auditable answer — not "the AI decided."

---

## Related Projects

- **[readme-craft](https://github.com/DanielDeshmukh/readme-craft)** — Generate production-ready READMEs for any GitHub repo using AI

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
Made for developers who want their GitHub to do the talking.
</div>
