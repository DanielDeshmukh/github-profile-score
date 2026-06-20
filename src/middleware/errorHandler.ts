import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger('error-handler');

function renderErrorSvg(message: string): string {
  return `<svg width="320" height="80" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="80" fill="#0d1117" stroke="#f85149" stroke-width="1" rx="6"/>
    <text x="16" y="35" fill="#f85149" font-family="sans-serif" font-size="13">⚠ Error</text>
    <text x="16" y="55" fill="#8b949e" font-family="sans-serif" font-size="11">${message}</text>
  </svg>`;
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    log.warn({ code: err.code, message: err.message }, 'Application error');
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  log.error({ error: err.message, stack: err.stack }, 'Unhandled error');

  const wantsSvg = req.path.endsWith('.svg') || req.headers.accept?.includes('image/svg+xml');
  if (wantsSvg) {
    res.status(500).type('image/svg+xml').set('Cache-Control', 'no-store').send(renderErrorSvg('Something went wrong'));
    return;
  }

  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
