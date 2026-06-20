import { tokens } from '../../theme/tokens.js';

const AVATAR_COLORS = [tokens.blue, tokens.green, tokens.purple, tokens.gold];

function hashUsername(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) - hash + username.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(username: string): string {
  const cleaned = username.replace(/[^a-zA-Z0-9]/g, '');
  if (cleaned.length === 0) return '?';
  if (cleaned.length === 1) return cleaned.toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

function getAvatarColor(username: string): string {
  const idx = hashUsername(username) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx]!;
}

function getTextColor(bgColor: string): string {
  if (bgColor === tokens.gold) return tokens.bg;
  return tokens.textPrimary;
}

export function renderInitialsAvatar(
  username: string,
  cx: number,
  cy: number,
  r: number,
): string {
  const initials = getInitials(username);
  const bgColor = getAvatarColor(username);
  const textColor = getTextColor(bgColor);
  const fontSize = Math.round(r * 0.78);

  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgColor}"/>
  <text x="${cx}" y="${cy}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="500" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${initials}</text>`;
}
