import * as fs from 'fs-extra';
import * as path from 'path';
import { APIMetadata } from '../types/api.types';
import {
  APIRegistryError,
  APIValidationError,
  DuplicateAPIError,
  FileReadError,
  FileWriteError,
} from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * API Registry class for managing curated public APIs
 * Validates: Requirements 5.1, 5.2, 5.4
 */
export class APIRegistry {
  private apis: APIMetadata[] = [];
  private registryPath: string;

  constructor(registryPath?: string) {
    this.registryPath = registryPath || path.join(__dirname, '../../data/api-registry.json');
    this.loadAPIs();
  }

  /**
   * Load APIs from JSON file
   */
  private loadAPIs(): void {
    try {
      if (fs.existsSync(this.registryPath)) {
        const data = fs.readFileSync(this.registryPath, 'utf-8');
        const parsed = JSON.parse(data);
        this.apis = parsed.apis || [];
        logger.logInfo(`Loaded ${this.apis.length} APIs from registry`);
      } else {
        this.apis = [];
        logger.logWarning('API registry file not found, starting with empty registry', {
          path: this.registryPath,
        });
      }
    } catch (error) {
      logger.logError(
        new FileReadError(this.registryPath, {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      this.apis = [];
      throw new APIRegistryError('Failed to load API registry', {
        path: this.registryPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Save APIs to JSON file
   */
  private saveAPIs(): void {
    try {
      fs.ensureDirSync(path.dirname(this.registryPath));
      fs.writeFileSync(
        this.registryPath,
        JSON.stringify({ apis: this.apis }, null, 2),
        'utf-8'
      );
      logger.logInfo('API registry saved successfully', { count: this.apis.length });
    } catch (error) {
      logger.logError(
        new FileWriteError(this.registryPath, {
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      throw new APIRegistryError('Failed to save API registry', {
        path: this.registryPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get all APIs from the registry
   * @returns Array of all API metadata
   */
  getAllAPIs(): APIMetadata[] {
    return [...this.apis];
  }

  /**
   * Get API by ID
   * @param id - Unique API identifier
   * @returns API metadata or null if not found
   */
  getAPIById(id: string): APIMetadata | null {
    const api = this.apis.find(api => api.id === id);
    return api ? { ...api } : null;
  }

  /**
   * Get APIs by category
   * @param category - Category to filter by
   * @returns Array of APIs in the specified category
   */
  getAPIsByCategory(category: string): APIMetadata[] {
    return this.apis
      .filter(api => api.category.toLowerCase() === category.toLowerCase())
      .map(api => ({ ...api }));
  }

  /**
   * Validate API metadata
   * Ensures all required fields are present and valid
   * Validates: Requirements 5.1, 5.4
   * @param api - API metadata to validate
   * @returns true if valid, false otherwise
   */
  validateAPI(api: APIMetadata): boolean {
    // Check all required fields are present
    if (!api.id || typeof api.id !== 'string' || api.id.trim() === '') {
      return false;
    }
    if (!api.name || typeof api.name !== 'string' || api.name.trim() === '') {
      return false;
    }
    if (!api.description || typeof api.description !== 'string' || api.description.trim() === '') {
      return false;
    }
    if (!api.category || typeof api.category !== 'string' || api.category.trim() === '') {
      return false;
    }
    if (!api.baseUrl || typeof api.baseUrl !== 'string' || api.baseUrl.trim() === '') {
      return false;
    }
    if (!api.sampleEndpoint || typeof api.sampleEndpoint !== 'string' || api.sampleEndpoint.trim() === '') {
      return false;
    }
    if (!api.authType || !['none', 'apikey', 'oauth'].includes(api.authType)) {
      return false;
    }
    if (typeof api.corsCompatible !== 'boolean') {
      return false;
    }
    if (!api.documentationUrl || typeof api.documentationUrl !== 'string' || api.documentationUrl.trim() === '') {
      return false;
    }

    return true;
  }

  /**
   * Add a new API to the registry
   * Validates: Requirements 5.4
   * @param api - API metadata to add
   * @throws Error if validation fails or ID already exists
   */
  addAPI(api: APIMetadata): void {
    // Validate the API
    if (!this.validateAPI(api)) {
      logger.logWarning('API validation failed', { apiId: api.id, apiName: api.name });
      throw new APIValidationError(
        'Invalid API metadata: all required fields must be present and valid',
        { api }
      );
    }

    // Check for duplicate ID
    if (this.apis.some(existingApi => existingApi.id === api.id)) {
      logger.logWarning('Attempted to add duplicate API', { apiId: api.id });
      throw new DuplicateAPIError(api.id);
    }

    // Add the API
    this.apis.push({ ...api });
    this.saveAPIs();
    logger.logInfo('API added successfully', { apiId: api.id, apiName: api.name });
  }

  /**
   * Get count of APIs in registry
   * @returns Number of APIs
   */
  getAPICount(): number {
    return this.apis.length;
  }

  /**
   * Get all unique categories
   * @returns Array of category names
   */
  getCategories(): string[] {
    const categories = new Set(this.apis.map(api => api.category));
    return Array.from(categories);
  }

  /**
   * Get APIs by authentication type
   * Validates: Requirements 5.5
   * @param authType - Authentication type to filter by
   * @returns Array of APIs with the specified authentication type
   */
  getAPIsByAuthType(authType: 'none' | 'apikey' | 'oauth'): APIMetadata[] {
    return this.apis
      .filter(api => api.authType === authType)
      .map(api => ({ ...api }));
  }
}
