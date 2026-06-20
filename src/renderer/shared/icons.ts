import { tokens } from '../../theme/tokens.js';

export const flameIcon = (x: number, y: number): string =>
  `<g transform="translate(${x}, ${y})" fill="none" stroke="${tokens.textSecondary}" stroke-width="1.5">
    <path d="M8 1c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-1-2-1-3 2 1 3 3 3 5a4 4 0 0 1-8 0c0-4 3-5 4-9z"/>
  </g>`;

export const trophyIcon = (x: number, y: number): string =>
  `<g transform="translate(${x}, ${y})" fill="none" stroke="${tokens.textSecondary}" stroke-width="1.5">
    <path d="M4 2h8v3a4 4 0 0 1-8 0V2z"/>
    <path d="M4 3H2v1a3 3 0 0 0 3 3"/>
    <path d="M12 3h2v1a3 3 0 0 1-3 3"/>
    <path d="M8 9v3M5 14h6M6 12h4v2H6z"/>
  </g>`;

export const starIcon = (x: number, y: number): string =>
  `<g transform="translate(${x}, ${y})" fill="none" stroke="${tokens.gold}" stroke-width="1.5" stroke-linejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </g>`;
