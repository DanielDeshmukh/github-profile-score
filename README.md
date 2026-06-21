<div align="center">

# github-profile-score

### An embeddable job-readiness scorer for GitHub profiles — powered by heuristics + AI callouts

[![CI](https://github.com/DanielDeshmukh/github-profile-score/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielDeshmukh/github-profile-score/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Tests](https://img.shields.io/badge/Tests-210%2B-brightgreen)](https://vitest.dev/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-9B59B6?logo=railway&logoColor=white)](https://railway.app)
[![Stars](https://img.shields.io/github/stars/DanielDeshmukh/github-profile-score?style=social)](https://github.com/DanielDeshmukh/github-profile-score)

![github-profile-score banner](./assets/github-profile-score-banner.png)

Drop a badge into any README and let your GitHub profile speak for itself.

[![Job Readiness Score](https://github-profile-score-production-db22.up.railway.app/score/DanielDeshmukh.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/score/DanielDeshmukh.svg?t=1)

</div>

---

## Table of Contents

- [What Is This?](#what-is-this)
- [Live Demos](#live-demos)
- [Quick Deploy](#quick-deploy-fork--go)
- [Scoring Dimensions](#scoring-dimensions)
- [API Reference](#api-reference)
  - [Score Badge](#score-badge)
  - [Score JSON](#score-json)
  - [Score HTML Report](#score-html-report)
  - [Score Improvement Plan](#score-improvement-plan)
  - [Stats Cards](#stats-cards)
  - [Insight Widgets](#insight-widgets)
  - [Health Check](#health-check)
- [Embedding Guide](#embedding-guide)
- [Visual Templates](#visual-templates)
- [Theming](#theming)
- [Architecture](#architecture)
- [Getting Started](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Caching Strategy](#caching-strategy)
- [Contributing](#contributing)
- [Related Projects](#related-projects)
- [License](#license)

---

## What Is This?

`github-profile-score` analyzes a GitHub profile across five hiring-signal dimensions and produces:

| Output | Format | Endpoint |
|--------|--------|----------|
| **Live SVG badge** | Embeddable in README | `/score/{username}.svg` |
| **Contributions card** | Streaks + 12-week heatmap | `/stats/{username}/contributions.svg` |
| **Overview card** | Stars, PRs, languages | `/stats/{username}/overview.svg` |
| **Languages card** | Language breakdown bars | `/stats/{username}/languages.svg` |
| **Insight widgets** | 7 activity/repo metrics | `/insights/{username}/*.svg` |
| **HTML report** | Dimension breakdown + AI callouts | `/score/{username}/html` |
| **JSON payload** | Full score data | `/score/{username}` |
| **Improvement plan** | Prioritized fix list | `/score/{username}/plan` |

The scoring is intentionally transparent — no black box. Raw scores are calculated from GitHub API data using documented heuristics. NVIDIA NIM (free tier, optional) then interprets those scores into human-readable "what to fix" notes.

---

## Live Demos

Previews render **real data** from the production endpoint.

### Score & Stats Cards

| Card | Preview | Dimensions |
|------|---------|------------|
| Score Badge | [![Score](https://github-profile-score-production-db22.up.railway.app/score/DanielDeshmukh.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/score/DanielDeshmukh.svg?t=1) | 480×224 |
| Contributions | [![Contributions](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/contributions.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/contributions.svg?t=1) | 480×210 |
| Overview | [![Overview](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/overview.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/overview.svg?t=1) | 480×180 |
| Languages | [![Languages](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/languages.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/languages.svg?t=1) | 480×180 |

### Insight Widgets

| Widget | Preview | Size |
|--------|---------|------|
| Most Active Repo | [![Most Active](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-active-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-active-repo.svg?t=1) | 320×80 |
| Account Age | [![Account Age](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/account-age.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/account-age.svg?t=1) | 320×80 |
| Most Starred Repo | [![Most Starred](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-starred-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-starred-repo.svg?t=1) | 320×80 |
| Longest Maintained Repo | [![Longest Maintained](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/longest-maintained-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/longest-maintained-repo.svg?t=1) | 320×80 |
| Contribution Trend | [![Trend](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/contribution-trend.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/contribution-trend.svg?t=1) | 320×80 |
| Avg Commits/Repo | [![Avg Commits](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/avg-commits-per-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/avg-commits-per-repo.svg?t=1) | 320×80 |
| Commit Pattern | [![Pattern](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commit-pattern.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commit-pattern.svg?t=1) | 320×100 |
| Commits per Tenure | [![Tenure](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commits-per-tenure.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commits-per-tenure.svg?t=1) | 320×80 |

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

## API Reference

### Base URL

```
https://github-profile-score-production-db22.up.railway.app
```

> All endpoints accept `?refresh=1` to bypass cache (rate-limited to 1 refresh per 10 min per username).

---

### Score Badge

Embed the job-readiness score badge in your README:

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME/html)
```

**How it looks:**

![Score Badge](https://github-profile-score-production-db22.up.railway.app/score/DanielDeshmukh.svg?t=1)

The badge renders a 480×224 card with:
- User avatar and `@username`
- Circular grade ring (A–F) with numeric score
- 5 dimension progress bars (Activity, Quality, Documentation, Diversity, Community)
- Scored-on date footer

| Header | Value |
|--------|-------|
| `Content-Type` | `image/svg+xml` |
| `Cache-Control` | `public, max-age=3600, s-maxage=3600` |
| `ETag` | `"<total>-<scored_at>"` |

---

### Score JSON

Returns the full score payload as JSON.

```
GET /score/:username
```

**Response:**

```json
{
  "username": "octocat",
  "total": 74,
  "grade": "B",
  "dimensions": {
    "activity":      { "score": 16, "max": 20, "callout": null },
    "quality":       { "score": 14, "max": 20, "callout": null },
    "documentation": { "score": 11, "max": 20, "callout": "Your documentation score is low." },
    "diversity":     { "score": 18, "max": 20, "callout": null },
    "community":     { "score": 15, "max": 20, "callout": null }
  }
}
```

---

### Score HTML Report

Full HTML report with dimension breakdown, fix callouts, and comparison percentiles. Opens in browser — not embeddable in README.

```
GET /score/:username/html
```

---

### Score Improvement Plan

Returns a prioritized improvement plan sorted by points available.

```
GET /score/:username/plan
```

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

### Stats Cards

Stats cards use a dark theme and are **independent** from the score badge — separate caching, refresh cycles, and API calls.

#### Contributions Card

```markdown
![Contributions](https://YOUR_DOMAIN/stats/YOUR_USERNAME/contributions.svg)
```

[![Contributions Card](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/contributions.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/contributions.svg?t=1)

Renders a 480×210 card showing:
- Total contributions count and date range
- Current streak with fire icon
- Longest streak with trophy icon
- 12-week contribution calendar heatmap

---

#### Overview Card

```markdown
![GitHub Stats](https://YOUR_DOMAIN/stats/YOUR_USERNAME/overview.svg)
```

[![Overview Card](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/overview.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/overview.svg?t=1)

Renders a 480×180 card showing:
- Total stars earned
- Total commits (last year)
- Total pull requests
- Top languages with color-coded progress bars

---

#### Languages Card

```markdown
![Languages](https://YOUR_DOMAIN/stats/YOUR_USERNAME/languages.svg)
```

[![Languages Card](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/languages.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/stats/DanielDeshmukh/languages.svg?t=1)

Renders a 480×180 card showing:
- Language names with proportional progress bars
- Byte counts and percentage breakdown
- GitHub brand colors for each language
- "+ more" indicator for additional languages

---

### Insight Widgets

Insight widgets are individually-renderable SVG cards revealing activity patterns, repo health, and account statistics.

All insight endpoints follow the pattern: `GET /insights/:username/:widget.svg`

#### Most Active Repo

```markdown
![Most Active Repo](https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-active-repo.svg)
```

[![Most Active Repo](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-active-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-active-repo.svg?t=1)

| Field | Type | Description |
|-------|------|-------------|
| `repoName` | `string` | Repository name (linked) |
| `commitCount` | `number` | Total commits |
| `repoUrl` | `string` | GitHub repository URL |

---

#### Account Age

```markdown
![Account Age](https://YOUR_DOMAIN/insights/YOUR_USERNAME/account-age.svg)
```

[![Account Age](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/account-age.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/account-age.svg?t=1)

| Field | Type | Description |
|-------|------|-------------|
| `years` | `number` | Years since account creation |
| `months` | `number` | Remaining months |
| `createdAt` | `string` | ISO date of account creation |

---

#### Most Starred Repo

```markdown
![Most Starred Repo](https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-starred-repo.svg)
```

[![Most Starred Repo](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-starred-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/most-starred-repo.svg?t=1)

| Field | Type | Description |
|-------|------|-------------|
| `repoName` | `string` | Repository name (linked) |
| `stars` | `number` | Star count |
| `repoUrl` | `string` | GitHub repository URL |

---

#### Contribution Trend

```markdown
![Contribution Trend](https://YOUR_DOMAIN/insights/YOUR_USERNAME/contribution-trend.svg)
```

[![Contribution Trend](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/contribution-trend.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/contribution-trend.svg?t=1)

| Symbol | Meaning |
|--------|---------|
| `↑` | Trending up (> +3% YoY) |
| `↓` | Trending down (< −3% YoY) |
| `→` | Steady (within ±3%) |

| Field | Type | Description |
|-------|------|-------------|
| `thisYearTotal` | `number` | Contributions this year |
| `lastYearTotal` | `number` | Contributions last year |
| `yoyPercentage` | `string` | Year-over-year change |
| `direction` | `string` | `up`, `down`, or `flat` |

---

#### Avg Commits per Repo

```markdown
![Avg Commits per Repo](https://YOUR_DOMAIN/insights/YOUR_USERNAME/avg-commits-per-repo.svg)
```

[![Avg Commits per Repo](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/avg-commits-per-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/avg-commits-per-repo.svg?t=1)

| Field | Type | Description |
|-------|------|-------------|
| `average` | `number` | Average commits per repo |
| `activeRepos` | `number` | Number of active repos |
| `totalCommits` | `number` | Total commits across all repos |

---

#### Longest-Maintained Repo

```markdown
![Longest Maintained](https://YOUR_DOMAIN/insights/YOUR_USERNAME/longest-maintained-repo.svg)
```

[![Longest Maintained](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/longest-maintained-repo.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/longest-maintained-repo.svg?t=1)

| Duration | Format |
|----------|--------|
| ≥ 365 days | `Xy Ym` or `Xy` |
| ≥ 30 days | `Xm` |
| < 30 days | `Xd` |

| Field | Type | Description |
|-------|------|-------------|
| `repoName` | `string` | Repository name (linked) |
| `spanDays` | `number` | Duration in days |
| `repoUrl` | `string` | GitHub repository URL |
| `firstCommitDate` | `string` | ISO date of first commit |
| `lastCommitDate` | `string` | ISO date of last commit |

---

#### Commit Pattern

```markdown
![Commit Pattern](https://YOUR_DOMAIN/insights/YOUR_USERNAME/commit-pattern.svg)
```

[![Commit Pattern](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commit-pattern.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commit-pattern.svg?t=1)

| Daypart | Hours (UTC) |
|---------|-------------|
| Mornings | 06:00–11:59 |
| Afternoons | 12:00–17:59 |
| Evenings | 18:00–23:59 |
| Late nights | 00:00–05:59 |

| Field | Type | Description |
|-------|------|-------------|
| `weekdayCount` | `number` | Commits on weekdays |
| `weekendCount` | `number` | Commits on weekends |
| `dominantDayType` | `string` | `weekday` or `weekend` |
| `dominantDayPart` | `string` | Most active time period |
| `totalCommits` | `number` | Total commits sampled |

> **Note:** Based on a 90-day sample. Labeled approximate.

---

#### Commits per Tenure

```markdown
![Commits per Tenure](https://YOUR_DOMAIN/insights/YOUR_USERNAME/commits-per-tenure.svg)
```

[![Commits per Tenure](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commits-per-tenure.svg?t=1)](https://github-profile-score-production-db22.up.railway.app/insights/DanielDeshmukh/commits-per-tenure.svg?t=1)

Zero new API calls — pure derivation from profile age and contribution count.

| Field | Type | Description |
|-------|------|-------------|
| `average` | `number` | Commits per year |
| `totalCommits` | `number` | Total commits |
| `tenureYears` | `number` | Account age in years |

---

### Health Check

```
GET /health
```

Liveness check. Returns cache status, uptime, and GitHub API rate limit remaining.

```json
{
  "status": "healthy",
  "uptime": 3847.2,
  "cache": { "type": "redis", "connected": true },
  "github": { "rateLimitRemaining": 4832 }
}
```

---

### Error States

| Status | Condition | Preview |
|--------|-----------|---------|
| `404` | User not found | ![Not Found](./templates-v2/14-error-user-not-found.svg) |
| `429` | Rate limited | ![Rate Limit](./templates-v2/13-error-rate-limit.svg) |

---

## Embedding Guide

### Basic Usage

Copy the badge URL into your README:

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME/html)
```

### Full Profile Dashboard

Combine multiple cards for a complete profile view:

```markdown
### My GitHub Stats

[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME/html)

![Contributions](https://YOUR_DOMAIN/stats/YOUR_USERNAME/contributions.svg)
![Overview](https://YOUR_DOMAIN/stats/YOUR_USERNAME/overview.svg)
![Languages](https://YOUR_DOMAIN/stats/YOUR_USERNAME/languages.svg)
```

### Insight Widgets Row

```markdown
![Most Active](https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-active-repo.svg)
![Account Age](https://YOUR_DOMAIN/insights/YOUR_USERNAME/account-age.svg)
![Most Starred](https://YOUR_DOMAIN/insights/YOUR_USERNAME/most-starred-repo.svg)
```

### Force Fresh Data

Add `?refresh=1` to bypass server cache (rate-limited to 1 refresh per 10 min):

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg?refresh=1)](https://YOUR_DOMAIN/score/YOUR_USERNAME/html)
```

> **Note:** The `&t=1` parameter is already included in README links to bust GitHub's CDN cache — this is separate from the server-side refresh.

---

## Visual Templates

All SVG card outputs are available as static templates in the [`templates/`](./templates/) directory. Open them in a browser to see exactly what each card looks like.

| Card | Preview File | Dimensions |
|------|-------------|------------|
| Score Badge | [`01-score-badge.svg`](./templates/01-score-badge.svg) | 480×224 |
| Contributions | [`02-contributions-card.svg`](./templates/02-contributions-card.svg) | 480×210 |
| Overview | [`03-overview-card.svg`](./templates/03-overview-card.svg) | 480×180 |
| Languages | [`04-languages-card.svg`](./templates/04-languages-card.svg) | 480×180 |
| Most Active Repo | [`05-insight-most-active-repo.svg`](./templates/05-insight-most-active-repo.svg) | 320×80 |
| Account Age | [`06-insight-account-age.svg`](./templates/06-insight-account-age.svg) | 320×80 |
| Most Starred Repo | [`07-insight-most-starred-repo.svg`](./templates/07-insight-most-starred-repo.svg) | 320×80 |
| Contribution Trend | [`08-insight-contribution-trend.svg`](./templates/08-insight-contribution-trend.svg) | 320×80 |
| Avg Commits/Repo | [`09-insight-avg-commits-per-repo.svg`](./templates/09-insight-avg-commits-per-repo.svg) | 320×80 |
| Commit Pattern | [`11-insight-commit-pattern.svg`](./templates/11-insight-commit-pattern.svg) | 320×100 |
| Commits per Tenure | [`12-insight-commits-per-tenure.svg`](./templates/12-insight-commits-per-tenure.svg) | 320×80 |
| Rate Limit Error | [`13-error-rate-limit.svg`](./templates/13-error-rate-limit.svg) | 480×120 |
| User Not Found | [`14-error-user-not-found.svg`](./templates/14-error-user-not-found.svg) | 480×120 |

---

## Theming

All SVG cards use a GitHub-inspired dark dashboard theme. The color palette is centralized in `src/theme/tokens.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0d1117` | Card backgrounds |
| `bgCard` | `#161b22` | Inner card surfaces |
| `textPrimary` | `#e6edf3` | Headings, big numbers |
| `textSecondary` | `#8b949e` | Labels, secondary text |
| `blue` | `#58a6ff` | Primary accent (streaks, rings) |
| `purple` | `#a371f7` | Secondary accent (grade ring) |
| `green` | `#3fb950` | Positive trend, contributions |
| `red` | `#f85149` | Errors, declining trend |
| `gold` | `#e3b341` | Stars, special values |
| `border` | `rgba(48, 54, 61, 0.8)` | Card borders, dividers |

**Language bar segments** preserve each language's recognizable GitHub brand color (e.g. Python blue `#3572A5`, JS yellow `#f1e05a`) — only the card chrome uses the dark theme tokens.

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
                │   TTL: 5 minutes      │      └──────────────┘
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
                │   (template-driven)   │
                └──────────┬────────────┘
                           │
                           ▼
                      SVG Response
                  + cache write (5m TTL)
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
| `npm run typecheck` | Type-check without emitting |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | **Yes** | — | GitHub Personal Access Token |
| `NVIDIA_API_KEY` | No | — | NVIDIA NIM API key for AI callouts |
| `REDIS_URL` | No | — | Redis connection string (empty = in-memory cache) |
| `PORT` | No | `3000` | Server port |
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
│   │   │   ├── ring.ts                   # Shared grade/progress ring
│   │   │   ├── templateLoader.ts         # Template file reader
│   │   │   ├── sparkline.ts              # 12-week heatmap generator
│   │   │   ├── tile.ts                   # Metric tile builder
│   │   │   ├── avatar.ts                 # SVG avatar generator
│   │   │   └── icons.ts                  # Flame, trophy, star icons
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
│   │   └── tokens.ts                     # Centralized color palette
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
├── templates/                            # Working SVG templates (with placeholders)
├── templates-v2/                         # Design reference (untouched)
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
| `score:` | Score badge result | 5 minutes |
| `stats:v1:` | Stats card result | 5 minutes |
| `github:<user>:` | Raw GitHub data | 1 hour |
| `insight:<slug>:v1:` | Insight widget result | 5 minutes |
| `refresh_cooldown:` | Rate-limit refresh | 10 minutes |

Score, stats, and insight caches use **distinct key prefixes** so refreshing one does not invalidate the others.

### Response Headers

| Header | SVG Responses | JSON Responses |
|--------|--------------|----------------|
| `Cache-Control` | `public, max-age=3600, s-maxage=3600` | `public, max-age=300` |
| `ETag` | `<content-hash>` | — |

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

**Made for developers who want their GitHub to do the talking.**

[![Star](https://img.shields.io/github/stars/DanielDeshmukh/github-profile-score?style=social)](https://github.com/DanielDeshmukh/github-profile-score)
[![Watch](https://img.shields.io/github/watchers/DanielDeshmukh/github-profile-score?style=social)](https://github.com/DanielDeshmukh/github-profile-score)
[![Fork](https://img.shields.io/github/forks/DanielDeshmukh/github-profile-score?style=social)](https://github.com/DanielDeshmukh/github-profile-score)

</div>
