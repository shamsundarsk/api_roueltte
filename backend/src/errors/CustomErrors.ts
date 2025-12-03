/**
 * Custom error classes for Mashup Maker
 * Provides specific error types for different failure scenarios
 * Validates: Requirement 6.4
 */

/**
 * Base custom error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * API Registry related errors
 */
export class APIRegistryError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'API_REGISTRY_ERROR', details);
    Object.setPrototypeOf(this, APIRegistryError.prototype);
  }
}

export class APIValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'API_VALIDATION_ERROR', details);
    Object.setPrototypeOf(this, APIValidationError.prototype);
  }
}

export class APINotFoundError extends AppError {
  constructor(apiId: string) {
    super(`API with id "${apiId}" not found`, 404, 'API_NOT_FOUND', { apiId });
    Object.setPrototypeOf(this, APINotFoundError.prototype);
  }
}

export class DuplicateAPIError extends AppError {
  constructor(apiId: string) {
    super(`API with id "${apiId}" already exists`, 409, 'DUPLICATE_API', { apiId });
    Object.setPrototypeOf(this, DuplicateAPIError.prototype);
  }
}

export class InsufficientAPIsError extends AppError {
  constructor(required: number, available: number) {
    super(
      `Insufficient APIs available. Need ${required}, but only ${available} available after filtering.`,
      400,
      'INSUFFICIENT_APIS',
      { required, available }
    );
    Object.setPrototypeOf(this, InsufficientAPIsError.prototype);
  }
}

export class InsufficientCategoriesError extends AppError {
  constructor(required: number, available: number) {
    super(
      `Insufficient categories available. Need ${required} different categories, but only ${available} available after filtering.`,
      400,
      'INSUFFICIENT_CATEGORIES',
      { required, available }
    );
    Object.setPrototypeOf(this, InsufficientCategoriesError.prototype);
  }
}

/**
 * Generation related errors
 */
export class GenerationError extends AppError {
  constructor(message: string, component: string, details?: any) {
    super(message, 500, 'GENERATION_ERROR', { component, ...details });
    Object.setPrototypeOf(this, GenerationError.prototype);
  }
}

export class IdeaGenerationError extends GenerationError {
  constructor(message: string, details?: any) {
    super(message, 'IdeaGenerator', details);
    Object.defineProperty(this, 'code', { value: 'IDEA_GENERATION_ERROR', writable: false });
    Object.setPrototypeOf(this, IdeaGenerationError.prototype);
  }
}

export class CodeGenerationError extends GenerationError {
  constructor(message: string, details?: any) {
    super(message, 'CodeGenerator', details);
    Object.defineProperty(this, 'code', { value: 'CODE_GENERATION_ERROR', writable: false });
    Object.setPrototypeOf(this, CodeGenerationError.prototype);
  }
}

export class UILayoutGenerationError extends GenerationError {
  constructor(message: string, details?: any) {
    super(message, 'UILayoutSuggester', details);
    Object.defineProperty(this, 'code', { value: 'UI_LAYOUT_GENERATION_ERROR', writable: false });
    Object.setPrototypeOf(this, UILayoutGenerationError.prototype);
  }
}

export class CodePreviewGenerationError extends GenerationError {
  constructor(message: string, details?: any) {
    super(message, 'CodePreviewGenerator', details);
    Object.defineProperty(this, 'code', { value: 'CODE_PREVIEW_GENERATION_ERROR', writable: false });
    Object.setPrototypeOf(this, CodePreviewGenerationError.prototype);
  }
}

/**
 * File system related errors
 */
export class FileSystemError extends AppError {
  constructor(message: string, operation: string, details?: any) {
    super(message, 500, 'FILE_SYSTEM_ERROR', { operation, ...details });
    Object.setPrototypeOf(this, FileSystemError.prototype);
  }
}

export class ZIPCreationError extends FileSystemError {
  constructor(message: string, details?: any) {
    super(message, 'ZIP_CREATION', details);
    Object.defineProperty(this, 'code', { value: 'ZIP_CREATION_ERROR', writable: false });
    Object.setPrototypeOf(this, ZIPCreationError.prototype);
  }
}

export class FileNotFoundError extends AppError {
  constructor(filename: string) {
    super(
      'The requested file does not exist or has expired',
      404,
      'FILE_NOT_FOUND',
      { filename }
    );
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
  }
}

export class FileReadError extends FileSystemError {
  constructor(filepath: string, details?: any) {
    super(`Failed to read file: ${filepath}`, 'FILE_READ', { filepath, ...details });
    Object.defineProperty(this, 'code', { value: 'FILE_READ_ERROR', writable: false });
    Object.setPrototypeOf(this, FileReadError.prototype);
  }
}

export class FileWriteError extends FileSystemError {
  constructor(filepath: string, details?: any) {
    super(`Failed to write file: ${filepath}`, 'FILE_WRITE', { filepath, ...details });
    Object.defineProperty(this, 'code', { value: 'FILE_WRITE_ERROR', writable: false });
    Object.setPrototypeOf(this, FileWriteError.prototype);
  }
}

export class CleanupError extends FileSystemError {
  constructor(message: string, details?: any) {
    super(message, 'CLEANUP', details);
    Object.defineProperty(this, 'code', { value: 'CLEANUP_ERROR', writable: false });
    Object.setPrototypeOf(this, CleanupError.prototype);
  }
}

/**
 * Validation related errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class InvalidFilenameError extends ValidationError {
  constructor(filename: string) {
    super('Invalid filename provided', { filename });
    Object.defineProperty(this, 'code', { value: 'INVALID_FILENAME', writable: false });
    Object.setPrototypeOf(this, InvalidFilenameError.prototype);
  }
}

/**
 * Pipeline related errors
 */
export class PipelineError extends AppError {
  constructor(message: string, stage: string, details?: any) {
    super(message, 500, 'PIPELINE_ERROR', { stage, ...details });
    Object.setPrototypeOf(this, PipelineError.prototype);
  }
}
