/**
 * Error logging utility
 * Provides structured logging for errors with different severity levels
 * Validates: Requirement 6.4
 */

import { AppError } from '../errors/CustomErrors';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  stack?: string;
  context?: any;
}

/**
 * Error logger class for structured logging
 */
export class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with full details
   */
  logError(error: Error | AppError, context?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, error, context);
    this.writeLog(entry);
  }

  /**
   * Log a warning
   */
  logWarning(message: string, details?: any, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      details,
      context,
    };
    this.writeLog(entry);
  }

  /**
   * Log an info message
   */
  logInfo(message: string, details?: any, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      details,
      context,
    };
    this.writeLog(entry);
  }

  /**
   * Log a debug message
   */
  logDebug(message: string, details?: any, context?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        message,
        details,
        context,
      };
      this.writeLog(entry);
    }
  }

  /**
   * Create a structured log entry from an error
   */
  private createLogEntry(
    level: LogLevel,
    error: Error | AppError,
    context?: any
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: error.message,
      stack: error.stack,
      context,
    };

    // Add additional fields for AppError instances
    if (error instanceof AppError) {
      entry.code = error.code;
      entry.statusCode = error.statusCode;
      entry.details = error.details;
    }

    return entry;
  }

  /**
   * Write log entry to console (can be extended to write to files or external services)
   */
  private writeLog(entry: LogEntry): void {
    const logMessage = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
    }
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level}]`,
      entry.code ? `[${entry.code}]` : '',
      entry.message,
    ];

    let formatted = parts.filter(Boolean).join(' ');

    if (entry.details) {
      formatted += `\nDetails: ${JSON.stringify(entry.details, null, 2)}`;
    }

    if (entry.context) {
      formatted += `\nContext: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.stack && process.env.NODE_ENV === 'development') {
      formatted += `\nStack: ${entry.stack}`;
    }

    return formatted;
  }
}

/**
 * Convenience function to get logger instance
 */
export const logger = ErrorLogger.getInstance();
