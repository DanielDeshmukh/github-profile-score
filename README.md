<div align="center">

# github-profile-score

**An embeddable job-readiness scorer for GitHub profiles — powered by heuristics + AI callouts**

If this project saves you time, consider giving it a star. It helps others find it.

[![Star this repo](https://img.shields.io/github/stars/USERNAME/github-profile-score?style=social)](https://github.com/USERNAME/github-profile-score)

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

## What Is This?

`github-profile-score` analyzes a GitHub profile across five hiring-signal dimensions and produces:

- **A live SVG badge** you embed directly in your README (`/score/{username}.svg`)
- **A detailed HTML breakdown** with dimension scores and AI-written fix callouts
- **A shareable permalink** for your portfolio or job applications

The scoring is intentionally transparent — no black box. Raw scores are calculated from GitHub API data using documented heuristics. NVIDIA NIM (free tier) then interprets those scores into human-readable "what to fix" notes.

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

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (local or managed, e.g. Upstash)
- GitHub Personal Access Token (for 5,000 req/hr vs 60 req/hr unauthenticated)
- NVIDIA NIM API key ([free at build.nvidia.com](https://build.nvidia.com/))

### Installation

```bash
git clone https://github.com/USERNAME/github-profile-score.git
cd github-profile-score
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# GitHub
GITHUB_TOKEN=ghp_your_token_here

# Redis
REDIS_URL=redis://localhost:6379

# NVIDIA NIM
NVIDIA_API_KEY=nvapi-your_key_here
NVIDIA_MODEL=meta/llama-3.1-8b-instruct   # or mistralai/mixtral-8x7b-instruct

# Server
PORT=3000
CACHE_TTL_SECONDS=21600   # 6 hours
SCORE_THRESHOLD=14        # dimensions below this get AI callouts
```

### Run Locally

```bash
# Start Redis (if running locally)
redis-server

# Start the service
npm run dev

# Test it
curl http://localhost:3000/score/torvalds.svg
```

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
    "documentation": { "score": 11, "max": 20, "callout": "Only 4 of your 23 repos have a README longer than 3 lines. Add setup instructions and a short description to your top 5 pinned repos." },
    "diversity":     { "score": 18, "max": 20, "callout": null },
    "community":     { "score": 15, "max": 20, "callout": null }
  },
  "cached": true,
  "cache_age_seconds": 1820
}
```

### `GET /score/:username/html`
Full HTML report with dimension breakdown, fix callouts, and comparison percentiles.

### `GET /health`
Liveness check. Returns Redis connection status and GitHub API rate limit remaining.

---

## Embed in Your README

Copy this snippet and replace `your-username`:

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

## Project Structure

```
github-profile-score/
├── src/
│   ├── fetcher/
│   │   └── GitHubFetcher.ts       # All GitHub REST API calls
│   ├── scorer/
│   │   ├── HeuristicScorer.ts     # Dimension scoring logic
│   │   └── dimensions/
│   │       ├── activity.ts
│   │       ├── quality.ts
│   │       ├── documentation.ts
│   │       ├── diversity.ts
│   │       └── community.ts
│   ├── ai/
│   │   └── NvidiaCalloutWriter.ts # NVIDIA NIM integration
│   ├── renderer/
│   │   └── SvgRenderer.ts         # SVG card templating
│   ├── cache/
│   │   └── RedisCache.ts          # Redis wrapper + TTL logic
│   └── server.ts                  # Express routes
├── tests/
│   ├── scorer.test.ts             # (add tests here)
│   └── fetcher.mock.ts            # (add mocks here)
├── .env.example
├── package.json
└── README.md
```

---

## Caching Strategy

GitHub's authenticated rate limit is **5,000 requests/hour**. A single profile fetch costs approximately 4–6 API calls (profile, repos, events, languages). Without caching you'd exhaust your limit at ~800 unique profiles/hour.

| Layer | TTL | Eviction |
|-------|-----|----------|
| Redis (score result) | 6 hours | LRU |
| Redis (raw GitHub data) | 1 hour | LRU |
| CDN (SVG response) | 1 hour | Cache-Control header |

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

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
Made for developers who want their GitHub to do the talking.
</div>