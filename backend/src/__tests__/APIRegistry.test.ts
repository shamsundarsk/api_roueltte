import { APIRegistry } from '../registry/APIRegistry';
import { APIMetadata } from '../types/api.types';
import * as path from 'path';
import * as fc from 'fast-check';

describe('APIRegistry', () => {
  let registry: APIRegistry;
  const testRegistryPath = path.join(__dirname, '../../data/api-registry.json');

  beforeEach(() => {
    registry = new APIRegistry(testRegistryPath);
  });

  describe('getAllAPIs', () => {
    it('should return all APIs from the registry', () => {
      const apis = registry.getAllAPIs();
      expect(apis).toBeDefined();
      expect(Array.isArray(apis)).toBe(true);
      expect(apis.length).toBeGreaterThanOrEqual(50);
    });

    it('should return a copy of the APIs array', () => {
      const apis1 = registry.getAllAPIs();
      const apis2 = registry.getAllAPIs();
      expect(apis1).not.toBe(apis2);
    });
  });

  describe('getAPIById', () => {
    it('should return API when ID exists', () => {
      const api = registry.getAPIById('openweather');
      expect(api).toBeDefined();
      expect(api?.id).toBe('openweather');
      expect(api?.name).toBe('OpenWeather API');
    });

    it('should return null when ID does not exist', () => {
      const api = registry.getAPIById('nonexistent-api');
      expect(api).toBeNull();
    });

    it('should return a copy of the API object', () => {
      const api1 = registry.getAPIById('openweather');
      const api2 = registry.getAPIById('openweather');
      expect(api1).not.toBe(api2);
    });
  });

  describe('getAPIsByCategory', () => {
    it('should return APIs in the specified category', () => {
      const weatherAPIs = registry.getAPIsByCategory('weather');
      expect(weatherAPIs.length).toBeGreaterThan(0);
      weatherAPIs.forEach(api => {
        expect(api.category.toLowerCase()).toBe('weather');
      });
    });

    it('should be case-insensitive', () => {
      const apis1 = registry.getAPIsByCategory('weather');
      const apis2 = registry.getAPIsByCategory('WEATHER');
      expect(apis1.length).toBe(apis2.length);
    });

    it('should return empty array for non-existent category', () => {
      const apis = registry.getAPIsByCategory('nonexistent-category');
      expect(apis).toEqual([]);
    });
  });

  describe('validateAPI', () => {
    const validAPI: APIMetadata = {
      id: 'test-api',
      name: 'Test API',
      description: 'A test API',
      category: 'test',
      baseUrl: 'https://api.test.com',
      sampleEndpoint: '/v1/test',
      authType: 'none',
      corsCompatible: true,
      documentationUrl: 'https://docs.test.com'
    };

    it('should return true for valid API', () => {
      expect(registry.validateAPI(validAPI)).toBe(true);
    });

    it('should return false when id is missing', () => {
      const invalidAPI = { ...validAPI, id: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when name is missing', () => {
      const invalidAPI = { ...validAPI, name: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when description is missing', () => {
      const invalidAPI = { ...validAPI, description: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when category is missing', () => {
      const invalidAPI = { ...validAPI, category: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when baseUrl is missing', () => {
      const invalidAPI = { ...validAPI, baseUrl: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when sampleEndpoint is missing', () => {
      const invalidAPI = { ...validAPI, sampleEndpoint: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when authType is invalid', () => {
      const invalidAPI = { ...validAPI, authType: 'invalid' as any };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when corsCompatible is not boolean', () => {
      const invalidAPI = { ...validAPI, corsCompatible: 'true' as any };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should return false when documentationUrl is missing', () => {
      const invalidAPI = { ...validAPI, documentationUrl: '' };
      expect(registry.validateAPI(invalidAPI)).toBe(false);
    });

    it('should accept valid authType values', () => {
      expect(registry.validateAPI({ ...validAPI, authType: 'none' })).toBe(true);
      expect(registry.validateAPI({ ...validAPI, authType: 'apikey' })).toBe(true);
      expect(registry.validateAPI({ ...validAPI, authType: 'oauth' })).toBe(true);
    });
  });

  describe('getAPICount', () => {
    it('should return the correct count of APIs', () => {
      const count = registry.getAPICount();
      const apis = registry.getAllAPIs();
      expect(count).toBe(apis.length);
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      const categories = registry.getCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check uniqueness
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });
  });

  // Feature: mashup-maker, Property 8: API Registry Metadata Completeness
  // Validates: Requirements 5.1, 5.4
  describe('Property 8: API Registry Metadata Completeness', () => {
    it('should ensure all required fields are present in validated APIs', () => {
      // Generator for valid API metadata
      const validAPIArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        category: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        authType: fc.constantFrom('none' as const, 'apikey' as const, 'oauth' as const),
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
        mockData: fc.option(fc.object(), { nil: undefined })
      });

      fc.assert(
        fc.property(validAPIArbitrary, (api) => {
          // Create a temporary registry for testing
          const tempRegistryPath = path.join(__dirname, `../../data/test-registry-${Date.now()}.json`);
          const testRegistry = new APIRegistry(tempRegistryPath);

          // If validation succeeds, the API should be added successfully
          const isValid = testRegistry.validateAPI(api);
          
          if (isValid) {
            // Add the API to the registry
            testRegistry.addAPI(api);
            
            // Retrieve the API from the registry
            const storedAPI = testRegistry.getAPIById(api.id);
            
            // Verify all required fields are present and match
            expect(storedAPI).not.toBeNull();
            expect(storedAPI!.id).toBe(api.id);
            expect(storedAPI!.name).toBe(api.name);
            expect(storedAPI!.description).toBe(api.description);
            expect(storedAPI!.category).toBe(api.category);
            expect(storedAPI!.baseUrl).toBe(api.baseUrl);
            expect(storedAPI!.sampleEndpoint).toBe(api.sampleEndpoint);
            expect(storedAPI!.authType).toBe(api.authType);
            expect(storedAPI!.corsCompatible).toBe(api.corsCompatible);
            expect(storedAPI!.documentationUrl).toBe(api.documentationUrl);
            
            // Clean up test file
            const fs = require('fs-extra');
            if (fs.existsSync(tempRegistryPath)) {
              fs.unlinkSync(tempRegistryPath);
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mashup-maker, Property 9: API Registry Filtering
  // Validates: Requirements 5.5
  describe('Property 9: API Registry Filtering', () => {
    it('should return only APIs matching the category filter', () => {
      fc.assert(
        fc.property(fc.constantFrom(...registry.getCategories()), (category) => {
          const filteredAPIs = registry.getAPIsByCategory(category);
          
          // All returned APIs should match the filter criteria
          return filteredAPIs.every(api => 
            api.category.toLowerCase() === category.toLowerCase()
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should return only APIs matching the authType filter', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('none' as const, 'apikey' as const, 'oauth' as const),
          (authType) => {
            const filteredAPIs = registry.getAPIsByAuthType(authType);
            
            // All returned APIs should match the filter criteria
            return filteredAPIs.every(api => api.authType === authType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle filtering with no matches gracefully', () => {
      // Test with a non-existent category
      const nonExistentCategory = 'nonexistent-category-xyz-123';
      const filteredAPIs = registry.getAPIsByCategory(nonExistentCategory);
      
      expect(filteredAPIs).toEqual([]);
      expect(Array.isArray(filteredAPIs)).toBe(true);
    });
  });
});
