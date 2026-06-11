import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger('error-handler');

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    log.warn({ code: err.code, message: err.message }, 'Application error');
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  log.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
