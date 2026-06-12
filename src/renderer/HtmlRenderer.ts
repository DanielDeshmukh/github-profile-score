import type { ScoreResult } from '../types.js';

const GRADE_COLORS: Record<ScoreResult['grade'], string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
};

function createDimensionBar(name: string, score: number, max: number, callout: string | null, reason: string): string {
  const pct = Math.round((score / max) * 100);
  return `
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="color:#e5e7eb;font-weight:600">${name}</span>
        <span style="color:#9ca3af">${score}/${max}</span>
      </div>
      <div style="background:#1f2937;border-radius:6px;height:8px;overflow:hidden">
        <div style="background:${GRADE_COLORS.A};width:${pct}%;height:100%;border-radius:6px"></div>
      </div>
      <div style="color:#6b7280;font-size:12px;margin-top:4px">${reason}</div>
      ${callout ? `<div style="color:#fbbf24;font-size:12px;margin-top:4px;padding:8px;background:#1e1b09;border-radius:6px;border:1px solid #854d0e">💡 ${callout}</div>` : ''}
    </div>`;
}

export function renderHtml(result: ScoreResult): string {
  const gradeColor = GRADE_COLORS[result.grade];
  const domain = process.env.PUBLIC_DOMAIN || 'http://localhost:3000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.username} — GitHub Profile Score</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e5e7eb; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .card { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; border: 3px solid ${gradeColor}; }
    .score-circle { width: 80px; height: 80px; border-radius: 50%; border: 4px solid ${gradeColor}; display: flex; align-items: center; justify-content: center; flex-direction: column; }
    .score-num { font-size: 28px; font-weight: bold; color: ${gradeColor}; }
    .score-grade { font-size: 14px; color: ${gradeColor}; }
    .dimensions { margin-top: 20px; }
    .footer { margin-top: 16px; text-align: center; color: #64748b; font-size: 12px; }
    a { color: ${gradeColor}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img class="avatar" src="${result.dimensions.activity ? '' : ''}https://github.com/${result.username}.png?size=64" alt="${result.username}" onerror="this.style.display='none'">
        <div>
          <h1 style="font-size:20px;color:#f1f5f9">@${result.username}</h1>
          <p style="color:#94a3b8">GitHub Profile Score</p>
        </div>
        <div class="score-circle" style="margin-left:auto">
          <div class="score-num">${result.total}</div>
          <div class="score-grade">${result.grade}</div>
        </div>
      </div>
      <div class="dimensions">
        ${createDimensionBar('Activity', result.dimensions.activity.score, result.dimensions.activity.max, result.dimensions.activity.callout, result.dimensions.activity.reason)}
        ${createDimensionBar('Project Quality', result.dimensions.quality.score, result.dimensions.quality.max, result.dimensions.quality.callout, result.dimensions.quality.reason)}
        ${createDimensionBar('Documentation', result.dimensions.documentation.score, result.dimensions.documentation.max, result.dimensions.documentation.callout, result.dimensions.documentation.reason)}
        ${createDimensionBar('Tech Diversity', result.dimensions.diversity.score, result.dimensions.diversity.max, result.dimensions.diversity.callout, result.dimensions.diversity.reason)}
        ${createDimensionBar('Community', result.dimensions.community.score, result.dimensions.community.max, result.dimensions.community.callout, result.dimensions.community.reason)}
      </div>
      <div class="footer">
        <p>Scored on ${new Date(result.scored_at).toLocaleDateString()} • <a href="${domain}/score/${result.username}">View JSON</a></p>
        ${result.dimensions.documentation.score < 14 ? `
        <div style="margin-top:16px;padding:12px;background:#1e1b4a;border-radius:8px;border:1px solid #4338ca">
          <p style="color:#a5b4fc;font-size:13px;margin:0">
            📝 Want to improve your Documentation score? Check out <a href="https://github.com/DanielDeshmukh/readme-craft" style="color:#818cf8;font-weight:600">readme-craft</a> — generate a production-ready README in seconds.
          </p>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}
