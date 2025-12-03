import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * Error handling middleware
 * Catches and formats errors for consistent API responses
 * Validates: Requirement 6.4
 */

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: ApiError | AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error with context
  logger.logError(err, {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    ip: req.ip,
  });

  // Determine status code and error details
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if ('statusCode' in err && err.statusCode) {
    statusCode = err.statusCode;
    code = err.code || 'ERROR';
    message = err.message;
    details = err.details;
  } else {
    // Generic error
    message = err.message || message;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred';
    details = undefined;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

/**
 * Validation error handler
 * Formats Joi validation errors
 */
export const validationErrorHandler = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.isJoi) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      },
    });
  } else {
    next(error);
  }
};
