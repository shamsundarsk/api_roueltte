/**
 * Environment variable validation utility for frontend
 * Validates required Vite environment variables
 */

interface EnvConfig {
  VITE_API_BASE_URL: string;
}

/**
 * Validates and parses environment variables
 * @throws Error if required variables are missing or invalid
 * @returns Validated environment configuration
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Validate VITE_API_BASE_URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    errors.push('VITE_API_BASE_URL must be defined and non-empty');
  } else {
    // Validate URL format
    try {
      new URL(apiBaseUrl);
    } catch {
      errors.push(`VITE_API_BASE_URL must be a valid URL. Got: ${apiBaseUrl}`);
    }
  }

  // If there are validation errors, throw
  if (errors.length > 0) {
    throw new Error(
      `Environment variable validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }

  return {
    VITE_API_BASE_URL: apiBaseUrl,
  };
}

/**
 * Gets validated environment configuration
 * Should be called after validateEnv() has been run
 */
export function getEnvConfig(): EnvConfig {
  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  };
}
