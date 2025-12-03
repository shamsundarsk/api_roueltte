import { APISelector } from '../selector/APISelector';
import { APIRegistry } from '../registry/APIRegistry';
import { APIMetadata } from '../types/api.types';
import * as path from 'path';
import * as fc from 'fast-check';

describe('APISelector', () => {
  let registry: APIRegistry;
  let selector: APISelector;

  beforeEach(() => {
    // Use the actual registry file for testing
    const registryPath = path.join(__dirname, '../../data/api-registry.json');
    registry = new APIRegistry(registryPath);
    selector = new APISelector(registry);
  });

  describe('selectAPIs', () => {
    it('should select exactly 3 APIs by default', () => {
      const selected = selector.selectAPIs();
      expect(selected).toHaveLength(3);
    });

    it('should select the specified number of APIs', () => {
      const selected = selector.selectAPIs(5);
      expect(selected).toHaveLength(5);
    });

    it('should select unique APIs', () => {
      const selected = selector.selectAPIs(3);
      expect(selector.ensureUniqueness(selected)).toBe(true);
    });

    it('should select APIs from different categories', () => {
      const selected = selector.selectAPIs(3);
      expect(selector.ensureDiversity(selected)).toBe(true);
    });

    it('should throw error when insufficient APIs available', () => {
      // Request more APIs than exist
      expect(() => selector.selectAPIs(1000)).toThrow('Insufficient APIs available');
    });

    it('should throw error when insufficient categories available', () => {
      // Filter to only one category, then try to select 3
      const allAPIs = registry.getAllAPIs();
      const categories = new Set(allAPIs.map(api => api.category));
      const categoriesToExclude = Array.from(categories).slice(1); // Exclude all but one
      
      const options = { excludeCategories: categoriesToExclude };
      
      expect(() => selector.selectAPIs(3, options)).toThrow('Insufficient categories available');
    });

    it('should respect corsOnly option', () => {
      const selected = selector.selectAPIs(3, { corsOnly: true });
      expect(selected.every(api => api.corsCompatible)).toBe(true);
    });

    it('should respect requireAuth option', () => {
      const selected = selector.selectAPIs(3, { requireAuth: true });
      expect(selected.every(api => api.authType === 'apikey' || api.authType === 'oauth')).toBe(true);
    });

    it('should respect excludeCategories option', () => {
      const excludedCategories = ['weather', 'music'];
      const selected = selector.selectAPIs(3, { excludeCategories: excludedCategories });
      
      expect(selected.every(api => 
        !excludedCategories.some(cat => cat.toLowerCase() === api.category.toLowerCase())
      )).toBe(true);
    });

    it('should respect excludeAPIIds option for regeneration', () => {
      // First selection
      const firstSelection = selector.selectAPIs(3);
      const excludedIds = firstSelection.map(api => api.id);
      
      // Second selection excluding first APIs
      const secondSelection = selector.selectAPIs(3, { excludeAPIIds: excludedIds });
      
      // Verify none of the excluded APIs are in the second selection
      expect(secondSelection.every(api => !excludedIds.includes(api.id))).toBe(true);
    });

    it('should select different APIs when regenerating', () => {
      // First selection
      const firstSelection = selector.selectAPIs(3);
      const firstIds = firstSelection.map(api => api.id).sort();
      
      // Second selection excluding first APIs
      const secondSelection = selector.selectAPIs(3, { 
        excludeAPIIds: firstSelection.map(api => api.id) 
      });
      const secondIds = secondSelection.map(api => api.id).sort();
      
      // Verify the selections are different
      expect(firstIds).not.toEqual(secondIds);
    });
  });

  describe('ensureUniqueness', () => {
    it('should return true for unique APIs', () => {
      const apis = registry.getAllAPIs().slice(0, 3);
      expect(selector.ensureUniqueness(apis)).toBe(true);
    });

    it('should return false for duplicate APIs', () => {
      const api = registry.getAllAPIs()[0];
      const apis = [api, api];
      expect(selector.ensureUniqueness(apis)).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(selector.ensureUniqueness([])).toBe(true);
    });
  });

  describe('ensureDiversity', () => {
    it('should return true for APIs from different categories', () => {
      const allAPIs = registry.getAllAPIs();
      const categories = new Set<string>();
      const diverseAPIs: APIMetadata[] = [];
      
      for (const api of allAPIs) {
        if (!categories.has(api.category.toLowerCase())) {
          diverseAPIs.push(api);
          categories.add(api.category.toLowerCase());
          if (diverseAPIs.length === 3) break;
        }
      }
      
      expect(selector.ensureDiversity(diverseAPIs)).toBe(true);
    });

    it('should return false for APIs from the same category', () => {
      const weatherAPIs = registry.getAPIsByCategory('weather');
      if (weatherAPIs.length >= 2) {
        expect(selector.ensureDiversity(weatherAPIs.slice(0, 2))).toBe(false);
      }
    });

    it('should be case-insensitive for categories', () => {
      const allAPIs = registry.getAllAPIs();
      // Create two APIs with same category but different case
      const api1 = allAPIs[0];
      const api2 = { ...allAPIs[1], category: api1.category.toUpperCase() };
      
      expect(selector.ensureDiversity([api1, api2])).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(selector.ensureDiversity([])).toBe(true);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: mashup-maker, Property 1: API Selection Constraints
     * Validates: Requirements 1.1, 1.2
     * 
     * For any mashup generation request with a registry containing at least 3 categories 
     * with at least one API each, the selected APIs should be exactly 3 in count, 
     * all unique, and each from a different category.
     */
    it('should always select exactly 3 unique APIs from different categories', () => {
      // Generator for API metadata
      const arbitraryAPIMetadata = (id: string, category: string): fc.Arbitrary<APIMetadata> => {
        return fc.record({
          id: fc.constant(id),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 200 }),
          category: fc.constant(category),
          baseUrl: fc.webUrl(),
          sampleEndpoint: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s}`),
          authType: fc.constantFrom('none' as const, 'apikey' as const, 'oauth' as const),
          corsCompatible: fc.boolean(),
          documentationUrl: fc.webUrl(),
          mockData: fc.option(fc.object(), { nil: undefined })
        });
      };

      // Generator for a registry with at least 3 categories, each with at least 1 API
      const arbitraryAPIRegistry = fc.tuple(
        fc.integer({ min: 3, max: 10 }), // number of categories
        fc.integer({ min: 1, max: 5 })   // APIs per category
      ).chain(([numCategories, apisPerCategory]) => {
        const categoryNames = fc.array(
          fc.string({ minLength: 3, maxLength: 20 }),
          { minLength: numCategories, maxLength: numCategories }
        ).map(names => {
          // Ensure unique category names
          const uniqueNames = Array.from(new Set(names));
          while (uniqueNames.length < numCategories) {
            uniqueNames.push(`category_${uniqueNames.length}`);
          }
          return uniqueNames.slice(0, numCategories);
        });

        return categoryNames.chain(categories => {
          const apisPromises = categories.map((category, catIndex) => {
            return fc.array(
              fc.integer({ min: 0, max: 1000 }).chain(apiIndex => {
                const id = `api_${catIndex}_${apiIndex}`;
                return arbitraryAPIMetadata(id, category);
              }),
              { minLength: apisPerCategory, maxLength: apisPerCategory }
            );
          });

          return fc.tuple(...apisPromises).map(apiArrays => {
            return apiArrays.flat();
          });
        });
      });

      // Property test
      fc.assert(
        fc.property(arbitraryAPIRegistry, (apis) => {
          // Create a temporary registry with the generated APIs
          const tempRegistryPath = path.join(__dirname, '../../data/temp-test-registry.json');
          const fs = require('fs-extra');
          
          try {
            // Write temporary registry
            fs.ensureDirSync(path.dirname(tempRegistryPath));
            fs.writeFileSync(tempRegistryPath, JSON.stringify({ apis }, null, 2));
            
            // Create registry and selector
            const testRegistry = new APIRegistry(tempRegistryPath);
            const testSelector = new APISelector(testRegistry);
            
            // Select 3 APIs
            const selected = testSelector.selectAPIs(3);
            
            // Verify exactly 3 APIs selected
            expect(selected).toHaveLength(3);
            
            // Verify all APIs are unique
            const uniqueIds = new Set(selected.map(api => api.id));
            expect(uniqueIds.size).toBe(3);
            
            // Verify all APIs are from different categories
            const categories = selected.map(api => api.category.toLowerCase());
            const uniqueCategories = new Set(categories);
            expect(uniqueCategories.size).toBe(3);
            
            // Verify using the selector's own validation methods
            expect(testSelector.ensureUniqueness(selected)).toBe(true);
            expect(testSelector.ensureDiversity(selected)).toBe(true);
          } finally {
            // Cleanup temporary file
            if (fs.existsSync(tempRegistryPath)) {
              fs.unlinkSync(tempRegistryPath);
            }
          }
        }),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });
  });
});
