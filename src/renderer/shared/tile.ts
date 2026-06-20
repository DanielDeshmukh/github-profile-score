import { tokens } from '../../theme/tokens.js';

export interface MetricTileOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  suffix?: string;
  warn?: boolean;
}

export function renderMetricTile(options: MetricTileOptions): string {
  const { x, y, width, height, label, value, suffix, warn } = options;
  const fill = warn ? tokens.bgTileWarn : tokens.bgTile;
  const labelFill = warn ? tokens.amber : tokens.textSecondary;
  const valueFill = warn ? tokens.amber : tokens.textPrimary;
  const suffixFill = tokens.textTertiary;

  const labelY = y + 18;
  const valueY = y + 38;
  const valueX = x + 12;
  const labelX = x + 12;

  const suffixMarkup = suffix
    ? `<text x="${valueX + value.length * 9.6}" y="${valueY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${suffixFill}">${suffix}</text>`
    : '';

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="${fill}"/>
  <text x="${labelX}" y="${labelY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${labelFill}">${label}</text>
  <text x="${valueX}" y="${valueY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="500" fill="${valueFill}">${value}</text>
  ${suffixMarkup}`;
}
