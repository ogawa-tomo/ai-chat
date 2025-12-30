import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error occurred:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errorResponse: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.errors,
    };
    res.status(400).json({ error: errorResponse });
    return;
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    const errorResponse: ApiError = {
      code: err.code,
      message: err.message,
      details: err.details,
    };
    res.status(err.statusCode).json({ error: errorResponse });
    return;
  }

  // Handle Anthropic API errors
  if (err.name === 'APIError') {
    const errorResponse: ApiError = {
      code: 'CLAUDE_API_ERROR',
      message: 'Claude API request failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    };
    res.status(503).json({ error: errorResponse });
    return;
  }

  // Handle generic errors
  const errorResponse: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  };
  res.status(500).json({ error: errorResponse });
}
