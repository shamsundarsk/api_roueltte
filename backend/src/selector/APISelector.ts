import { APIMetadata, SelectionOptions } from '../types/api.types';
import { APIRegistry } from '../registry/APIRegistry';
import { InsufficientAPIsError, InsufficientCategoriesError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * API Selector class for selecting unique APIs from different categories
 * Validates: Requirements 1.1, 1.2
 */
export class APISelector {
  private registry: APIRegistry;

  constructor(registry: APIRegistry) {
    this.registry = registry;
  }

  /**
   * Select a specified number of unique APIs from different categories
   * Validates: Requirements 1.1, 1.2
   * @param count - Number of APIs to select (default: 3)
   * @param options - Optional selection criteria
   * @returns Array of selected API metadata
   * @throws Error if insufficient APIs or categories available
   */
  selectAPIs(count: number = 3, options?: SelectionOptions): APIMetadata[] {
    // Get all available APIs
    let availableAPIs = this.registry.getAllAPIs();

    // Apply filters based on options
    if (options?.excludeCategories && options.excludeCategories.length > 0) {
      availableAPIs = availableAPIs.filter(
        api => !options.excludeCategories!.some(
          cat => cat.toLowerCase() === api.category.toLowerCase()
        )
      );
    }

    // Exclude previously selected APIs for regeneration
    if (options?.excludeAPIIds && options.excludeAPIIds.length > 0) {
      availableAPIs = availableAPIs.filter(
        api => !options.excludeAPIIds!.includes(api.id)
      );
    }

    if (options?.corsOnly) {
      availableAPIs = availableAPIs.filter(api => api.corsCompatible);
    }

    if (options?.requireAuth !== undefined) {
      if (options.requireAuth) {
        availableAPIs = availableAPIs.filter(
          api => api.authType === 'apikey' || api.authType === 'oauth'
        );
      } else {
        availableAPIs = availableAPIs.filter(api => api.authType === 'none');
      }
    }

    // Check if we have enough APIs
    if (availableAPIs.length < count) {
      logger.logWarning('Insufficient APIs for selection', {
        required: count,
        available: availableAPIs.length,
        options,
      });
      throw new InsufficientAPIsError(count, availableAPIs.length);
    }

    // Group APIs by category
    const apisByCategory = new Map<string, APIMetadata[]>();
    for (const api of availableAPIs) {
      const category = api.category.toLowerCase();
      if (!apisByCategory.has(category)) {
        apisByCategory.set(category, []);
      }
      apisByCategory.get(category)!.push(api);
    }

    // Check if we have enough categories
    const availableCategories = Array.from(apisByCategory.keys());
    if (availableCategories.length < count) {
      logger.logWarning('Insufficient categories for selection', {
        required: count,
        available: availableCategories.length,
        options,
      });
      throw new InsufficientCategoriesError(count, availableCategories.length);
    }

    // Select random categories
    const selectedCategories = this.selectRandomCategories(availableCategories, count);

    // Select one random API from each selected category
    const selectedAPIs: APIMetadata[] = [];
    for (const category of selectedCategories) {
      const categoryAPIs = apisByCategory.get(category)!;
      const randomAPI = this.selectRandomElement(categoryAPIs);
      selectedAPIs.push(randomAPI);
    }

    // Validate the selection
    if (!this.ensureUniqueness(selectedAPIs)) {
      logger.logError(new Error('Failed to ensure uniqueness of selected APIs'), {
        selectedAPIs: selectedAPIs.map(api => api.id),
      });
      throw new Error('Failed to ensure uniqueness of selected APIs');
    }

    if (!this.ensureDiversity(selectedAPIs)) {
      logger.logError(new Error('Failed to ensure diversity of selected APIs'), {
        selectedAPIs: selectedAPIs.map(api => ({ id: api.id, category: api.category })),
      });
      throw new Error('Failed to ensure diversity of selected APIs');
    }

    logger.logInfo('APIs selected successfully', {
      count: selectedAPIs.length,
      apis: selectedAPIs.map(api => ({ id: api.id, name: api.name, category: api.category })),
    });

    return selectedAPIs;
  }

  /**
   * Ensure all APIs in the array are unique (no duplicate IDs)
   * @param apis - Array of API metadata to validate
   * @returns true if all APIs are unique, false otherwise
   */
  ensureUniqueness(apis: APIMetadata[]): boolean {
    const ids = new Set<string>();
    for (const api of apis) {
      if (ids.has(api.id)) {
        return false;
      }
      ids.add(api.id);
    }
    return true;
  }

  /**
   * Ensure all APIs are from different categories
   * @param apis - Array of API metadata to validate
   * @returns true if all APIs are from different categories, false otherwise
   */
  ensureDiversity(apis: APIMetadata[]): boolean {
    const categories = new Set<string>();
    for (const api of apis) {
      const category = api.category.toLowerCase();
      if (categories.has(category)) {
        return false;
      }
      categories.add(category);
    }
    return true;
  }

  /**
   * Select random categories from available categories
   * @param categories - Array of category names
   * @param count - Number of categories to select
   * @returns Array of selected category names
   */
  private selectRandomCategories(categories: string[], count: number): string[] {
    const shuffled = [...categories];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  /**
   * Select a random element from an array
   * @param array - Array to select from
   * @returns Random element from the array
   */
  private selectRandomElement<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  /**
   * Select specific APIs by their IDs
   * @param apiIds - Array of API IDs to select
   * @returns Array of selected API metadata
   * @throws Error if any API ID is not found
   */
  selectSpecificAPIs(apiIds: string[]): APIMetadata[] {
    const selectedAPIs: APIMetadata[] = [];
    const allAPIs = this.registry.getAllAPIs();

    for (const id of apiIds) {
      const api = allAPIs.find(a => a.id === id);
      if (!api) {
        logger.logWarning('API not found for manual selection', { apiId: id });
        throw new Error(`API with ID "${id}" not found`);
      }
      selectedAPIs.push(api);
    }

    // Validate uniqueness
    if (!this.ensureUniqueness(selectedAPIs)) {
      logger.logError(new Error('Duplicate APIs in manual selection'), {
        apiIds,
      });
      throw new Error('Duplicate APIs selected');
    }

    logger.logInfo('Specific APIs selected successfully', {
      count: selectedAPIs.length,
      apis: selectedAPIs.map(api => ({ id: api.id, name: api.name, category: api.category })),
    });

    return selectedAPIs;
  }

  /**
   * Get all available categories
   * @returns Array of unique category names
   */
  getAvailableCategories(): string[] {
    const allAPIs = this.registry.getAllAPIs();
    const categories = new Set<string>();
    
    for (const api of allAPIs) {
      categories.add(api.category);
    }
    
    return Array.from(categories).sort();
  }

  /**
   * Get APIs grouped by category
   * @returns Map of category names to arrays of APIs
   */
  getAPIsByCategory(): Map<string, APIMetadata[]> {
    const allAPIs = this.registry.getAllAPIs();
    const apisByCategory = new Map<string, APIMetadata[]>();
    
    for (const api of allAPIs) {
      if (!apisByCategory.has(api.category)) {
        apisByCategory.set(api.category, []);
      }
      apisByCategory.get(api.category)!.push(api);
    }
    
    return apisByCategory;
  }
}
