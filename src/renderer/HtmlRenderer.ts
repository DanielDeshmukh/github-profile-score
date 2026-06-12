import type { ScoreResult } from '../types.js';

function getBarColor(percentage: number): string {
  if (percentage >= 80) return '#c9a962';
  if (percentage >= 60) return '#a89050';
  if (percentage >= 40) return '#7d8a96';
  return '#3d2e2e';
}

function createDimensionRow(name: string, score: number, max: number, callout: string | null): string {
  const pct = Math.round((score / max) * 100);
  const barColor = getBarColor(pct);

  return `
    <div style="padding:12px 32px;border-bottom:1px solid #1e2229;display:grid;grid-template-columns:150px 1fr 48px;gap:16px;align-items:center">
      <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:#7d8a96;letter-spacing:0.02em">${name}</span>
      <div style="height:5px;background:#1e2229;border-radius:99px;overflow:hidden">
        <div style="height:100%;border-radius:99px;width:${pct}%;background:${barColor}"></div>
      </div>
      <span style="font-family:'Inter',sans-serif;font-size:12px;color:#e8d5a3;text-align:right;font-variant-numeric:tabular-nums">${score}/${max}</span>
    </div>
    ${callout ? `<div style="padding:0 32px 12px"><div style="color:#a89050;font-size:12px;padding:8px 12px;background:#1a1a1a;border-radius:6px;border:1px solid #2d3748">${callout}</div></div>` : ''}`;
}

function generateImprovements(result: ScoreResult) {
  return (Object.entries(result.dimensions) as [string, { score: number; max: number; callout: string | null }][])
    .filter(([_, dim]) => dim.score < dim.max)
    .map(([dimension, dim]) => ({
      dimension,
      current_score: dim.score,
      max_score: dim.max,
      points_available: dim.max - dim.score,
      callout: dim.callout,
    }))
    .sort((a, b) => b.points_available - a.points_available);
}

export function renderHtml(result: ScoreResult): string {
  const scoreDate = new Date(result.scored_at).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
  const improvements = generateImprovements(result);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.username} — GitHub Profile Score</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #111315; color: #e8d5a3; margin: 0; font-family: 'Inter', sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 2rem 1rem; }
    .card { background: #1a1a1a; border: 1px solid #2d3748; border-radius: 12px; margin-bottom: 16px; }
    .card-header { border-top: 2px solid #c9a962; border-radius: 12px; padding: 28px 32px; display: flex; align-items: center; gap: 16px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid #c9a962; }
    .username { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: #e8d5a3; }
    .subtitle { font-family: 'Inter', sans-serif; font-size: 12px; color: #7d8a96; }
    .score-section { margin-left: auto; text-align: right; }
    .score-number { font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 600; color: #e8d5a3; line-height: 1; }
    .grade-pill { display: inline-block; background: #2d3748; color: #c9a962; border: 1px solid #c9a962; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; padding: 3px 12px; border-radius: 99px; margin-top: 4px; }
    .dimensions-card { padding: 8px 0; }
    .dimension-row:hover { background: #1e2229; transition: background 150ms; }
    .improvements-header { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 500; color: #c9a962; border-bottom: 1px solid #2d3748; padding: 16px 32px 12px; }
    .improvement-row { padding: 12px 32px; border-bottom: 1px solid #1e2229; }
    .improvement-name { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #e8d5a3; }
    .improvement-badge { display: inline-block; background: #2d3748; color: #c9a962; font-size: 11px; padding: 2px 8px; border-radius: 99px; margin-left: 8px; }
    .improvement-callout { font-family: 'Inter', sans-serif; font-size: 12px; color: #7d8a96; margin-top: 4px; }
    .footer { margin-top: 24px; text-align: center; }
    .footer-text { font-family: 'Inter', sans-serif; font-size: 11px; color: #4a5568; }
    .footer-link { color: #c9a962; text-decoration: none; border-bottom: 1px solid rgba(201, 169, 98, 0.25); }
    .footer-link:hover { border-bottom-color: #c9a962; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="card-header">
        <img class="avatar" src="https://github.com/${result.username}.png?size=80" alt="${result.username}">
        <div>
          <div class="username">@${result.username}</div>
          <div class="subtitle">GitHub Profile Score</div>
        </div>
        <div class="score-section">
          <div class="score-number">${result.total}</div>
          <div class="grade-pill">Grade ${result.grade}</div>
        </div>
      </div>
    </div>

    <div class="card dimensions-card">
      ${createDimensionRow('Activity', result.dimensions.activity.score, result.dimensions.activity.max, result.dimensions.activity.callout)}
      ${createDimensionRow('Project Quality', result.dimensions.quality.score, result.dimensions.quality.max, result.dimensions.quality.callout)}
      ${createDimensionRow('Documentation', result.dimensions.documentation.score, result.dimensions.documentation.max, result.dimensions.documentation.callout)}
      ${createDimensionRow('Tech Diversity', result.dimensions.diversity.score, result.dimensions.diversity.max, result.dimensions.diversity.callout)}
      ${createDimensionRow('Community', result.dimensions.community.score, result.dimensions.community.max, result.dimensions.community.callout)}
    </div>

    ${improvements.length > 0 ? `
    <div class="card">
      <div class="improvements-header">How to improve</div>
      ${improvements.map(item => `
      <div class="improvement-row">
        <div>
          <span class="improvement-name">${item.dimension.charAt(0).toUpperCase() + item.dimension.slice(1)}</span>
          <span class="improvement-badge">+${item.points_available} pts available</span>
        </div>
        ${item.callout ? `<div class="improvement-callout">${item.callout}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    <div class="footer">
      <div class="footer-text">Scored on ${scoreDate}</div>
      ${result.dimensions.documentation.score < 14 ? `
      <div style="margin-top:16px">
        <a href="https://github.com/DanielDeshmukh/readme-craft" class="footer-link">Improve your Documentation score with readme-craft</a>
      </div>` : ''}
    </div>
  </div>
</body>
</html>`;
}
