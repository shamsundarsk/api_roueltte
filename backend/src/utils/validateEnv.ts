/**
 * Environment variable validation utility
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  TEMP_DIR: string;
  MAX_ZIP_SIZE_MB: number;
  CLEANUP_INTERVAL_HOURS: number;
  AI_API_KEY?: string;
  AI_MODEL?: string;
  AI_API_URL?: string;
}

const VALID_NODE_ENVS = ['development', 'production', 'test'];

/**
 * Validates and parses environment variables
 * @throws Error if required variables are missing or invalid
 * @returns Validated environment configuration
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Validate PORT
  const port = process.env.PORT;
  const portNum = port ? parseInt(port, 10) : 3000;
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!VALID_NODE_ENVS.includes(nodeEnv)) {
    errors.push(
      `NODE_ENV must be one of: ${VALID_NODE_ENVS.join(', ')}. Got: ${nodeEnv}`
    );
  }

  // Validate TEMP_DIR
  const tempDir = process.env.TEMP_DIR || '/tmp/mashup-maker';
  if (!tempDir || tempDir.trim() === '') {
    errors.push('TEMP_DIR must be a non-empty string');
  }

  // Validate MAX_ZIP_SIZE_MB
  const maxZipSize = process.env.MAX_ZIP_SIZE_MB;
  const maxZipSizeNum = maxZipSize ? parseInt(maxZipSize, 10) : 50;
  if (isNaN(maxZipSizeNum) || maxZipSizeNum < 1) {
    errors.push('MAX_ZIP_SIZE_MB must be a positive number');
  }

  // Validate CLEANUP_INTERVAL_HOURS
  const cleanupInterval = process.env.CLEANUP_INTERVAL_HOURS;
  const cleanupIntervalNum = cleanupInterval ? parseInt(cleanupInterval, 10) : 24;
  if (isNaN(cleanupIntervalNum) || cleanupIntervalNum < 1) {
    errors.push('CLEANUP_INTERVAL_HOURS must be a positive number');
  }

  // If there are validation errors, throw
  if (errors.length > 0) {
    throw new Error(
      `Environment variable validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }

  return {
    PORT: portNum,
    NODE_ENV: nodeEnv,
    TEMP_DIR: tempDir,
    MAX_ZIP_SIZE_MB: maxZipSizeNum,
    CLEANUP_INTERVAL_HOURS: cleanupIntervalNum,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL || 'gpt-4',
    AI_API_URL: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
  };
}

/**
 * Gets validated environment configuration
 * Should be called after validateEnv() has been run
 */
export function getEnvConfig(): EnvConfig {
  return {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    TEMP_DIR: process.env.TEMP_DIR || '/tmp/mashup-maker',
    MAX_ZIP_SIZE_MB: parseInt(process.env.MAX_ZIP_SIZE_MB || '50', 10),
    CLEANUP_INTERVAL_HOURS: parseInt(process.env.CLEANUP_INTERVAL_HOURS || '24', 10),
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL || 'gpt-4',
    AI_API_URL: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
  };
}
