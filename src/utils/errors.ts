export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(username: string) {
    super(`GitHub user '${username}' not found`, 404, 'USER_NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds: number) {
    super(`GitHub API rate limit exceeded. Retry after ${retryAfterSeconds}s`, 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }

  public readonly retryAfterSeconds: number;
}

export class CircuitOpenError extends AppError {
  constructor() {
    super('GitHub API circuit breaker is open', 503, 'CIRCUIT_OPEN');
    this.name = 'CircuitOpenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AiCalloutError extends AppError {
  constructor(message: string) {
    super(message, 502, 'AI_CALLOUT_ERROR');
    this.name = 'AiCalloutError';
  }
}
