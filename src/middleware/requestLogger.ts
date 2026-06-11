import type { Request, Response, NextFunction } from 'express';
import { createChildLogger } from '../logger.js';

const log = createChildLogger('request');

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string | undefined;

  res.on('finish', () => {
    const duration = Date.now() - start;
    log.info(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        requestId,
      },
      'Request completed',
    );
  });

  next();
}
