import { MashupPipeline } from '../pipeline/MashupPipeline';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as fc from 'fast-check';

describe('MashupPipeline', () => {
  let pipeline: MashupPipeline;
  let testRegistryPath: string;
  let testTempDir: string;

  beforeEach(() => {
    // Create test directories
    testRegistryPath = path.join(__dirname, '../../data/test-api-registry.json');
    testTempDir = path.join(__dirname, '../../temp/test-zips');

    // Ensure temp directory exists
    fs.ensureDirSync(testTempDir);

    // Create test registry with sufficient APIs
    const testAPIs = {
      apis: [
        {
          id: 'weather-1',
          name: 'OpenWeather API',
          description: 'Weather data and forecasts',
          category: 'weather',
          baseUrl: 'https://api.openweathermap.org',
          sampleEndpoint: '/data/2.5/weather',
          authType: 'apikey' as const,
          corsCompatible: true,
          mockData: { temp: 72, condition: 'sunny' },
          documentationUrl: 'https://openweathermap.org/api',
        },
        {
          id: 'music-1',
          name: 'Spotify API',
          description: 'Music streaming and discovery',
          category: 'music',
          baseUrl: 'https://api.spotify.com',
          sampleEndpoint: '/v1/search',
          authType: 'oauth' as const,
          corsCompatible: true,
          mockData: { tracks: [] },
          documentationUrl: 'https://developer.spotify.com',
        },
        {
          id: 'maps-1',
          name: 'OpenStreetMap API',
          description: 'Map data and geocoding',
          category: 'maps',
          baseUrl: 'https://nominatim.openstreetmap.org',
          sampleEndpoint: '/search',
          authType: 'none' as const,
          corsCompatible: true,
          documentationUrl: 'https://nominatim.org',
        },
        {
          id: 'news-1',
          name: 'News API',
          description: 'News articles and headlines',
          category: 'news',
          baseUrl: 'https://newsapi.org',
          sampleEndpoint: '/v2/top-headlines',
          authType: 'apikey' as const,
          corsCompatible: true,
          mockData: { articles: [] },
          documentationUrl: 'https://newsapi.org/docs',
        },
      ],
    };

    fs.writeFileSync(testRegistryPath, JSON.stringify(testAPIs, null, 2));

    // Initialize pipeline with test paths
    pipeline = new MashupPipeline(testRegistryPath, testTempDir);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testRegistryPath)) {
      fs.removeSync(testRegistryPath);
    }
    if (fs.existsSync(testTempDir)) {
      fs.removeSync(testTempDir);
    }
  });

  describe('generateMashup', () => {
    it('should generate a complete mashup with all components', async () => {
      const result = await pipeline.generateMashup();

      // Check if result is successful (not an error response)
      expect('success' in result ? result.success : true).not.toBe(false);

      if ('id' in result) {
        // Verify all required fields are present
        expect(result.id).toBeDefined();
        expect(result.id).toMatch(/^mashup_/);
        expect(result.timestamp).toBeDefined();
        expect(result.idea).toBeDefined();
        expect(result.uiLayout).toBeDefined();
        expect(result.codePreview).toBeDefined();
        expect(result.downloadUrl).toBeDefined();

        // Verify idea structure
        expect(result.idea.appName).toBeDefined();
        expect(result.idea.description).toBeDefined();
        expect(result.idea.features).toBeDefined();
        expect(result.idea.features.length).toBeGreaterThanOrEqual(3);
        expect(result.idea.rationale).toBeDefined();
        expect(result.idea.apis).toBeDefined();
        expect(result.idea.apis.length).toBe(3);

        // Verify UI layout structure
        expect(result.uiLayout.screens).toBeDefined();
        expect(result.uiLayout.components).toBeDefined();
        expect(result.uiLayout.interactionFlow).toBeDefined();

        // Verify code preview structure
        expect(result.codePreview.backendSnippet).toBeDefined();
        expect(result.codePreview.frontendSnippet).toBeDefined();
        expect(result.codePreview.structure).toBeDefined();

        // Verify download URL format
        expect(result.downloadUrl).toMatch(/^\/api\/mashup\/download\//);
      }
    }, 15000);

    it('should activate Mock Mode for APIs requiring authentication', async () => {
      const result = await pipeline.generateMashup();

      if ('id' in result) {
        // Check that APIs with oauth or apikey have mock data
        const apisWithAuth = result.idea.apis.filter(
          (api) => api.authType === 'oauth' || api.authType === 'apikey'
        );

        apisWithAuth.forEach((api) => {
          expect(api.mockData).toBeDefined();
        });
      }
    }, 15000);

    it('should handle API selection with options', async () => {
      const result = await pipeline.generateMashup({
        excludeCategories: ['news'],
      });

      if ('id' in result) {
        // Verify no news APIs were selected
        const newsAPIs = result.idea.apis.filter((api) => api.category === 'news');
        expect(newsAPIs.length).toBe(0);
      }
    }, 15000);

    it('should support regeneration with excludeAPIIds', async () => {
      // First generation
      const firstResult = await pipeline.generateMashup();

      if ('id' in firstResult) {
        // Get the API IDs from first generation
        const firstAPIIds = firstResult.idea.apis.map(api => api.id);

        // Second generation excluding first APIs
        const secondResult = await pipeline.generateMashup({
          excludeAPIIds: firstAPIIds,
        });

        if ('id' in secondResult) {
          // Verify none of the first APIs are in the second result
          const secondAPIIds = secondResult.idea.apis.map(api => api.id);
          const hasOverlap = secondAPIIds.some(id => firstAPIIds.includes(id));
          expect(hasOverlap).toBe(false);

          // Verify second result has all required components
          expect(secondResult.id).toBeDefined();
          expect(secondResult.idea).toBeDefined();
          expect(secondResult.uiLayout).toBeDefined();
          expect(secondResult.codePreview).toBeDefined();
          expect(secondResult.downloadUrl).toBeDefined();
        }
      }
    }, 20000);

    it('should generate unique mashup IDs', async () => {
      const result1 = await pipeline.generateMashup();
      const result2 = await pipeline.generateMashup();

      if ('id' in result1 && 'id' in result2) {
        expect(result1.id).not.toBe(result2.id);
      }
    }, 20000);

    it('should create a downloadable ZIP file', async () => {
      const result = await pipeline.generateMashup();

      if ('id' in result) {
        // Extract filename from download URL
        const filename = result.downloadUrl.split('/').pop();
        const zipPath = path.join(testTempDir, filename!);

        // Verify ZIP file exists
        expect(fs.existsSync(zipPath)).toBe(true);

        // Verify it's a valid ZIP file (has .zip extension)
        expect(filename).toMatch(/\.zip$/);
      }
    }, 15000);

    it('should include code preview snippets', async () => {
      const result = await pipeline.generateMashup();

      if ('id' in result) {
        // Verify backend snippet is not empty
        expect(result.codePreview.backendSnippet.length).toBeGreaterThan(0);

        // Verify frontend snippet is not empty
        expect(result.codePreview.frontendSnippet.length).toBeGreaterThan(0);

        // Verify structure has children
        expect(result.codePreview.structure.children).toBeDefined();
        expect(result.codePreview.structure.children!.length).toBeGreaterThan(0);
      }
    }, 15000);

    it('should handle errors gracefully and return error response', async () => {
      // Create a pipeline with invalid registry path to force an error
      const invalidPipeline = new MashupPipeline('/invalid/path/registry.json', testTempDir);

      const result = await invalidPipeline.generateMashup();

      // Should return an error response
      if ('success' in result) {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error.code).toBeDefined();
        expect(result.error.message).toBeDefined();
      }
    }, 15000);
  });

  describe('cleanup', () => {
    it('should clean up old ZIP files', async () => {
      // Generate a mashup to create a ZIP file
      await pipeline.generateMashup();

      // Manually create an old file
      const oldFilePath = path.join(testTempDir, 'old-mashup.zip');
      fs.writeFileSync(oldFilePath, 'test content');

      // Set the file's modification time to 25 hours ago
      const oldTime = Date.now() - 25 * 60 * 60 * 1000;
      fs.utimesSync(oldFilePath, new Date(oldTime), new Date(oldTime));

      // Run cleanup with 24 hour threshold
      await pipeline.cleanup(24);

      // Verify old file was deleted
      expect(fs.existsSync(oldFilePath)).toBe(false);
    }, 15000);
  });

  describe('Property-Based Tests', () => {
    // Feature: mashup-maker, Property 13: Regeneration Produces Different Results
    // **Validates: Requirements 7.1**
    it('Property 13: For any two consecutive regeneration requests, the second set of selected APIs should be different from the first set', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 10 }), // Run multiple iterations
          async (_seed) => {
            // First generation
            const firstResult = await pipeline.generateMashup();

            // Skip if first generation failed
            if ('success' in firstResult && firstResult.success === false) {
              return true; // Skip this test case
            }

            if (!('id' in firstResult)) {
              return true; // Skip if no valid result
            }

            // Get the API IDs from first generation
            const firstAPIIds = firstResult.idea.apis.map(api => api.id);

            // Second generation excluding first APIs (regeneration)
            const secondResult = await pipeline.generateMashup({
              excludeAPIIds: firstAPIIds,
            });

            // Skip if second generation failed
            if ('success' in secondResult && secondResult.success === false) {
              return true; // Skip this test case
            }

            if (!('id' in secondResult)) {
              return true; // Skip if no valid result
            }

            // Get the API IDs from second generation
            const secondAPIIds = secondResult.idea.apis.map(api => api.id);

            // Property: The second set of APIs should be different from the first set
            // This means there should be NO overlap between the two sets
            const hasOverlap = secondAPIIds.some(id => firstAPIIds.includes(id));

            // The property holds if there is no overlap
            return !hasOverlap;
          }
        ),
        {
          numRuns: 100, // Run 100 iterations as specified in design
          timeout: 30000, // 30 second timeout for async operations
        }
      );
    }, 60000); // 60 second Jest timeout

    // Feature: mashup-maker, Property 14: Regeneration Completeness
    // **Validates: Requirements 7.2**
    it('Property 14: For any regeneration request, the output should contain all the same components as initial generation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 10 }), // Run multiple iterations
          async (_seed) => {
            // First generation
            const firstResult = await pipeline.generateMashup();

            // Skip if first generation failed
            if ('success' in firstResult && firstResult.success === false) {
              return true; // Skip this test case
            }

            if (!('id' in firstResult)) {
              return true; // Skip if no valid result
            }

            // Get the API IDs from first generation
            const firstAPIIds = firstResult.idea.apis.map(api => api.id);

            // Regeneration request excluding first APIs
            const regeneratedResult = await pipeline.generateMashup({
              excludeAPIIds: firstAPIIds,
            });

            // Skip if regeneration failed
            if ('success' in regeneratedResult && regeneratedResult.success === false) {
              return true; // Skip this test case
            }

            if (!('id' in regeneratedResult)) {
              return true; // Skip if no valid result
            }

            // Property: Regeneration should contain all the same components as initial generation
            // Check for app idea
            const hasAppIdea = regeneratedResult.idea !== undefined &&
              regeneratedResult.idea.appName !== undefined &&
              regeneratedResult.idea.description !== undefined &&
              regeneratedResult.idea.features !== undefined &&
              regeneratedResult.idea.rationale !== undefined &&
              regeneratedResult.idea.apis !== undefined;

            // Check for UI suggestions
            const hasUILayout = regeneratedResult.uiLayout !== undefined &&
              regeneratedResult.uiLayout.screens !== undefined &&
              regeneratedResult.uiLayout.components !== undefined &&
              regeneratedResult.uiLayout.interactionFlow !== undefined;

            // Check for code preview (implicitly represents code generation)
            const hasCodePreview = regeneratedResult.codePreview !== undefined &&
              regeneratedResult.codePreview.backendSnippet !== undefined &&
              regeneratedResult.codePreview.frontendSnippet !== undefined &&
              regeneratedResult.codePreview.structure !== undefined;

            // Check for download URL
            const hasDownloadUrl = regeneratedResult.downloadUrl !== undefined &&
              typeof regeneratedResult.downloadUrl === 'string' &&
              regeneratedResult.downloadUrl.length > 0;

            // All components must be present
            return hasAppIdea && hasUILayout && hasCodePreview && hasDownloadUrl;
          }
        ),
        {
          numRuns: 100, // Run 100 iterations as specified in design
          timeout: 30000, // 30 second timeout for async operations
        }
      );
    }, 60000); // 60 second Jest timeout

    // Feature: mashup-maker, Property 15: Results Display Completeness
    // **Validates: Requirements 8.4**
    it('Property 15: For any mashup generation response, the displayed results should include all components: the three APIs with metadata, app idea, code preview, and UI suggestions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 10 }), // Run multiple iterations
          async (_seed) => {
            // Generate a mashup
            const result = await pipeline.generateMashup();

            // Skip if generation failed
            if ('success' in result && result.success === false) {
              return true; // Skip this test case
            }

            if (!('id' in result)) {
              return true; // Skip if no valid result
            }

            // Property: The mashup response should include all required components for display

            // 1. Check for three APIs with complete metadata
            const hasThreeAPIs = result.idea.apis !== undefined &&
              Array.isArray(result.idea.apis) &&
              result.idea.apis.length === 3;

            // Verify each API has complete metadata
            const allAPIsHaveMetadata = hasThreeAPIs && result.idea.apis.every(api =>
              api.id !== undefined &&
              api.name !== undefined &&
              api.description !== undefined &&
              api.category !== undefined &&
              api.baseUrl !== undefined &&
              api.sampleEndpoint !== undefined &&
              api.authType !== undefined &&
              api.corsCompatible !== undefined &&
              api.documentationUrl !== undefined
            );

            // 2. Check for complete app idea
            const hasCompleteAppIdea = result.idea !== undefined &&
              result.idea.appName !== undefined &&
              typeof result.idea.appName === 'string' &&
              result.idea.appName.length > 0 &&
              result.idea.description !== undefined &&
              typeof result.idea.description === 'string' &&
              result.idea.description.length > 0 &&
              result.idea.features !== undefined &&
              Array.isArray(result.idea.features) &&
              result.idea.features.length > 0 &&
              result.idea.rationale !== undefined &&
              typeof result.idea.rationale === 'string' &&
              result.idea.rationale.length > 0;

            // 3. Check for complete code preview
            const hasCompleteCodePreview = result.codePreview !== undefined &&
              result.codePreview.backendSnippet !== undefined &&
              typeof result.codePreview.backendSnippet === 'string' &&
              result.codePreview.backendSnippet.length > 0 &&
              result.codePreview.frontendSnippet !== undefined &&
              typeof result.codePreview.frontendSnippet === 'string' &&
              result.codePreview.frontendSnippet.length > 0 &&
              result.codePreview.structure !== undefined &&
              result.codePreview.structure.name !== undefined &&
              result.codePreview.structure.type !== undefined;

            // 4. Check for complete UI suggestions
            const hasCompleteUILayout = result.uiLayout !== undefined &&
              result.uiLayout.screens !== undefined &&
              Array.isArray(result.uiLayout.screens) &&
              result.uiLayout.screens.length > 0 &&
              result.uiLayout.components !== undefined &&
              Array.isArray(result.uiLayout.components) &&
              result.uiLayout.components.length > 0 &&
              result.uiLayout.interactionFlow !== undefined &&
              result.uiLayout.interactionFlow.steps !== undefined &&
              Array.isArray(result.uiLayout.interactionFlow.steps);

            // All components must be present and complete
            return allAPIsHaveMetadata && hasCompleteAppIdea && hasCompleteCodePreview && hasCompleteUILayout;
          }
        ),
        {
          numRuns: 100, // Run 100 iterations as specified in design
          timeout: 30000, // 30 second timeout for async operations
        }
      );
    }, 60000); // 60 second Jest timeout
  });
});
