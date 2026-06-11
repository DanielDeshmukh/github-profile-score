import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

const USERNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

export function usernameValidator(req: Request, _res: Response, next: NextFunction): void {
  const username = req.params.username as string;

  if (!username || username.length > 39) {
    next(new ValidationError('Username must be 1-39 characters'));
    return;
  }

  if (!USERNAME_REGEX.test(username)) {
    next(new ValidationError('Invalid username format'));
    return;
  }

  next();
}
