<div align="center">

# github-profile-score

**An embeddable job-readiness scorer for GitHub profiles — powered by heuristics + AI callouts**

If this project saves you time, consider giving it a star. It helps others find it.

[![Star this repo](https://img.shields.io/github/stars/DanielDeshmukh/github-profile-score?style=social)](https://github.com/DanielDeshmukh/github-profile-score)

[![CI](https://github.com/DanielDeshmukh/github-profile-score/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielDeshmukh/github-profile-score/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red)](https://redis.io/)
[![NVIDIA NIM](https://img.shields.io/badge/AI-NVIDIA%20NIM-76b900)](https://build.nvidia.com/)

Drop a badge into any README and let your GitHub profile speak for itself.

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME)
```

> Replace `YOUR_DOMAIN` with your deployed service URL and `YOUR_USERNAME` with your GitHub username.

</div>

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

## What Is This?

`github-profile-score` analyzes a GitHub profile across five hiring-signal dimensions and produces:

- **A live SVG badge** you embed directly in your README (`/score/{username}.svg`)
- **A detailed HTML breakdown** with dimension scores and AI-written fix callouts
- **A shareable permalink** for your portfolio or job applications

The scoring is intentionally transparent — no black box. Raw scores are calculated from GitHub API data using documented heuristics. NVIDIA NIM (free tier, optional) then interprets those scores into human-readable "what to fix" notes.

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

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Request                          │
│              GET /score/{username}.svg                   │
└───────────────────────┬─────────────────────────────────┘
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
            │   GitHubFetcher       │
            │  - profile            │
            │  - repos (top 30)     │
            │  - events (90 days)   │
            │  - languages          │
            └──────────┬────────────┘
                       │
                       ▼
            ┌───────────────────────┐
            │   HeuristicScorer     │
            │  scores 5 dimensions  │
            │  no AI involved here  │
            └──────────┬────────────┘
                       │
                       ▼
            ┌───────────────────────┐
            │   NVIDIA NIM          │
            │  (only for dims < 14) │
            │  writes fix callouts  │
            └──────────┬────────────┘
                       │
                       ▼
            ┌───────────────────────┐
            │   SVG Renderer        │
            │  fills card template  │
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

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | **Yes** | GitHub Personal Access Token |
| `NVIDIA_API_KEY` | No | NVIDIA NIM API key for AI callouts |
| `REDIS_URL` | No | Redis connection (empty = in-memory cache) |
| `PORT` | No | Server port (default: 3000) |
| `CACHE_TTL_SECONDS` | No | Score badge cache TTL (default: 21600 = 6 hours) |
| `STATS_CACHE_TTL_SECONDS` | No | Stats card cache TTL (default: 21600 = 6 hours) |
| `SCORE_THRESHOLD` | No | Dimensions below this get callouts (default: 14) |

---

## API Endpoints

### `GET /score/:username.svg`
Returns the embeddable SVG card. This is the **primary embed URL**.

- Cached for 6 hours per username
- Returns `404` with an error card if the GitHub user doesn't exist
- Append `?refresh=1` to bust the cache (rate-limited to 1 refresh per 10 min per username)

### `GET /score/:username`
Returns the full JSON score payload.

```json
{
  "username": "octocat",
  "total": 74,
  "grade": "B",
  "dimensions": {
    "activity":      { "score": 16, "max": 20, "callout": null },
    "quality":       { "score": 14, "max": 20, "callout": null },
    "documentation": { "score": 11, "max": 20, "callout": "Your documentation score is low. Use readme-craft (https://github.com/DanielDeshmukh/readme-craft) to generate a production-ready README in seconds." },
    "diversity":     { "score": 18, "max": 20, "callout": null },
    "community":     { "score": 15, "max": 20, "callout": null }
  },
  "cached": true,
  "cache_age_seconds": 1820
}
```

### `GET /score/:username/html`
Full HTML report with dimension breakdown, fix callouts, and comparison percentiles.

### `GET /score/:username/plan`
Returns a prioritized improvement plan sorted by points available.

```json
{
  "username": "octocat",
  "total": 39,
  "grade": "F",
  "improvements": [
    {
      "dimension": "community",
      "current_score": 4,
      "max_score": 20,
      "points_available": 16,
      "callout": "Contribute to open source by submitting PRs and filing issues on other projects.",
      "priority": 1
    },
    {
      "dimension": "documentation",
      "current_score": 5,
      "max_score": 20,
      "points_available": 15,
      "callout": "Your documentation score is low. Use readme-craft to generate a production-ready README.",
      "priority": 2
    }
  ]
}
```

- Dimensions where score equals max are omitted (nothing to improve)
- Sorted descending by `points_available`
- `priority` is 1-indexed rank

### `GET /health`
Liveness check. Returns Redis connection status and GitHub API rate limit remaining.

---

## Stats Cards

In addition to the job-readiness score badge, the service provides GitHub stats cards showing contributions, streaks, and language breakdown. These use a gold/charcoal theme and are separate from the score badge — caching, refresh cycles, and API calls are all independent.

### `GET /stats/:username/contributions.svg`
Returns the contributions/streak SVG card showing total contributions, current streak with ring, and longest streak.

- Cached for 6 hours per username (independent of score badge cache)
- Returns `404` with an error card if the GitHub user doesn't exist
- Append `?refresh=1` to bust the cache

### `GET /stats/:username/overview.svg`
Returns the GitHub stats SVG card showing total stars earned, commits (last year), total PRs, total issues, and a grade ring.

### `GET /stats/:username/languages.svg`
Returns the language breakdown SVG card with a horizontal stacked bar and legend showing most-used languages by byte count.

### `GET /stats/:username`
Returns the full JSON stats payload.

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

## Embed Stats Cards in Your README

### Contributions Card

```markdown
![Contributions](https://YOUR_DOMAIN/stats/YOUR_USERNAME/contributions.svg)
```

### GitHub Stats Card

```markdown
![GitHub Stats](https://YOUR_DOMAIN/stats/YOUR_USERNAME/overview.svg)
```

### Language Breakdown Card

```markdown
![Languages](https://YOUR_DOMAIN/stats/YOUR_USERNAME/languages.svg)
```

### All Three Cards

```html
<a href="https://YOUR_DOMAIN/stats/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/stats/YOUR_USERNAME/contributions.svg" alt="Contributions" />
</a>
<a href="https://YOUR_DOMAIN/stats/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/stats/YOUR_USERNAME/overview.svg" alt="GitHub Stats" />
</a>
<a href="https://YOUR_DOMAIN/stats/YOUR_USERNAME">
  <img src="https://YOUR_DOMAIN/stats/YOUR_USERNAME/languages.svg" alt="Languages" />
</a>
```

### Theming

Stats cards use a fixed gold/charcoal theme by default. The color palette is centralized in `src/theme/tokens.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#111315` | Card backgrounds |
| `charcoal` | `#1a1a1a` | Secondary backgrounds |
| `gold` | `#c9a962` | Accent rings, highlights |
| `goldLight` | `#e8d5a3` | Primary text, numbers |
| `slate` | `#2d3748` | Borders, dividers |
| `silver` | `#7d8a96` | Secondary text, labels |

Language bar segments preserve each language's recognizable GitHub brand color (e.g. Python blue, JS yellow) — only the card chrome uses the gold/charcoal theme.

> **Note:** Custom theme overrides via query parameters are not yet supported but may be added in a future release.

---

## Embed in Your README

Copy this snippet and replace `YOUR_USERNAME`:

```markdown
[![Job Readiness Score](https://YOUR_DOMAIN/score/YOUR_USERNAME.svg)](https://YOUR_DOMAIN/score/YOUR_USERNAME/html)
```

Or use the HTML version for more control:

```html
<a href="https://YOUR_DOMAIN/score/YOUR_USERNAME/html">
  <img src="https://YOUR_DOMAIN/score/YOUR_USERNAME.svg" alt="GitHub Job Readiness Score" />
</a>
```

---

## Improve Your README

Low documentation score? Use [readme-craft](https://github.com/DanielDeshmukh/readme-craft) to generate a production-ready README in seconds.

Point it at any GitHub repo and get:
- Setup instructions
- Architecture notes
- Badges and usage examples
- All based on your actual codebase, not generic templates

---

## Project Structure

```
github-profile-score/
├── src/
│   ├── fetcher/
│   │   ├── GitHubFetcher.ts       # All GitHub REST API calls
│   │   └── StatsFetcher.ts        # GraphQL-based stats data fetching
│   ├── scorer/
│   │   ├── HeuristicScorer.ts     # Dimension scoring logic
│   │   ├── streak.ts              # Contribution streak calculation
│   │   └── dimensions/
│   │       ├── activity.ts
│   │       ├── quality.ts
│   │       ├── documentation.ts
│   │       ├── diversity.ts
│   │       └── community.ts
│   ├── ai/
│   │   ├── NvidiaCalloutWriter.ts # NVIDIA NIM integration
│   │   └── fallback.ts           # Static fallback callouts
│   ├── renderer/
│   │   ├── SvgRenderer.ts         # Score badge SVG templating
│   │   ├── ContributionsCardRenderer.ts  # Contributions/streak SVG
│   │   ├── StatsCardRenderer.ts   # GitHub stats + languages SVG
│   │   ├── HtmlRenderer.ts        # HTML report generation
│   │   └── shared/
│   │       └── ring.ts            # Shared grade ring drawing
│   ├── routes/
│   │   └── stats.ts               # Stats card endpoints
│   ├── theme/
│   │   ├── tokens.ts              # Centralized color palette
│   │   └── README.md              # Theme documentation
│   ├── types/
│   │   └── stats.ts               # Stats card data models
│   ├── cache/
│   │   ├── RedisCache.ts          # Redis wrapper + TTL logic
│   │   ├── MemoryCache.ts         # In-memory fallback
│   │   └── keys.ts                # Cache key generators
│   ├── utils/
│   │   └── escapeHtml.ts          # XSS-safe HTML escaping
│   └── server.ts                  # Express routes
├── tests/
│   ├── scorer.test.ts
│   ├── streak.test.ts
│   ├── contributions-card.test.ts
│   ├── stats-card.test.ts
│   ├── cache-keys.test.ts
│   └── escapeHtml.test.ts
├── .env.example
├── docker-compose.yml
├── railway.json
├── render.yaml
├── package.json
└── README.md
```

---

## Caching Strategy

GitHub's authenticated rate limit is **5,000 requests/hour**. A single profile fetch costs approximately 4–6 API calls (profile, repos, events, languages). Without caching you'd exhaust your limit at ~800 unique profiles/hour.

| Layer | TTL | Eviction |
|-------|-----|----------|
| Redis (score result) | 6 hours | LRU |
| Redis (stats result) | 6 hours | LRU |
| Redis (raw GitHub data) | 1 hour | LRU |
| CDN (SVG response) | 1 hour | Cache-Control header |

Score and stats caches use distinct key prefixes (`score:` vs `stats:v1:`) so refreshing one does not invalidate the other. Both use the same default TTL (6 hours) but can be configured independently via `CACHE_TTL_SECONDS` and `STATS_CACHE_TTL_SECONDS`.

Set `Cache-Control: public, max-age=3600, s-maxage=3600` on SVG responses to let Cloudflare/Fastly cache them at the edge.

---

## Deployment

### Docker

```bash
docker build -t github-profile-score .
docker run -p 3000:3000 --env-file .env github-profile-score
```

### Railway / Render

Both support one-click deploys from this repo. Set your environment variables in the dashboard and provision a Redis add-on.

### Self-hosted

The service is stateless except for Redis. Run as many instances behind a load balancer as you need — they all share the same Redis cache.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/new-dimension`
3. The scoring logic lives in `src/scorer/dimensions/` — each file exports a `score(repos, events, profile): number` function. Adding a dimension is self-contained.
4. Run tests: `npm test`
5. Open a PR

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
