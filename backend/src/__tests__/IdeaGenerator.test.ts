import { IdeaGenerator } from '../generator/IdeaGenerator';
import { APIMetadata } from '../types';
import * as fc from 'fast-check';

describe('IdeaGenerator', () => {
  let generator: IdeaGenerator;
  let sampleAPIs: APIMetadata[];

  beforeEach(() => {
    generator = new IdeaGenerator();
    sampleAPIs = [
      {
        id: 'api1',
        name: 'OpenWeather API',
        description: 'Weather data service',
        category: 'weather',
        baseUrl: 'https://api.openweathermap.org',
        sampleEndpoint: '/data/2.5/weather',
        authType: 'apikey',
        corsCompatible: true,
        documentationUrl: 'https://openweathermap.org/api',
      },
      {
        id: 'api2',
        name: 'Spotify API',
        description: 'Music streaming service',
        category: 'music',
        baseUrl: 'https://api.spotify.com',
        sampleEndpoint: '/v1/search',
        authType: 'oauth',
        corsCompatible: true,
        documentationUrl: 'https://developer.spotify.com',
      },
      {
        id: 'api3',
        name: 'Google Maps API',
        description: 'Location and mapping service',
        category: 'maps',
        baseUrl: 'https://maps.googleapis.com',
        sampleEndpoint: '/maps/api/geocode/json',
        authType: 'apikey',
        corsCompatible: true,
        documentationUrl: 'https://developers.google.com/maps',
      },
    ];
  });

  describe('generateIdea', () => {
    it('should generate a complete app idea with all required fields', () => {
      const idea = generator.generateIdea(sampleAPIs);

      expect(idea).toBeDefined();
      expect(idea.appName).toBeDefined();
      expect(typeof idea.appName).toBe('string');
      expect(idea.appName.length).toBeGreaterThan(0);

      expect(idea.description).toBeDefined();
      expect(typeof idea.description).toBe('string');
      expect(idea.description.length).toBeGreaterThan(0);

      expect(idea.features).toBeDefined();
      expect(Array.isArray(idea.features)).toBe(true);
      expect(idea.features.length).toBeGreaterThanOrEqual(3);
      expect(idea.features.length).toBeLessThanOrEqual(5);

      expect(idea.rationale).toBeDefined();
      expect(typeof idea.rationale).toBe('string');
      expect(idea.rationale.length).toBeGreaterThan(0);

      expect(idea.apis).toBeDefined();
      expect(idea.apis).toEqual(sampleAPIs);
    });

    it('should throw error if not exactly 3 APIs provided', () => {
      expect(() => generator.generateIdea([])).toThrow(
        'Exactly 3 APIs are required for idea generation'
      );
      expect(() => generator.generateIdea([sampleAPIs[0]])).toThrow(
        'Exactly 3 APIs are required for idea generation'
      );
      expect(() =>
        generator.generateIdea([sampleAPIs[0], sampleAPIs[1]])
      ).toThrow('Exactly 3 APIs are required for idea generation');
    });
  });

  describe('generateAppName', () => {
    it('should generate a non-empty app name', () => {
      const appName = generator.generateAppName(sampleAPIs);
      expect(appName).toBeDefined();
      expect(typeof appName).toBe('string');
      expect(appName.length).toBeGreaterThan(0);
    });
  });

  describe('generateDescription', () => {
    it('should generate a description with 2-4 sentences', () => {
      const description = generator.generateDescription(sampleAPIs);
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');

      // Count sentences (rough approximation)
      const sentenceCount = description.split('.').filter((s) => s.trim().length > 0).length;
      expect(sentenceCount).toBeGreaterThanOrEqual(2);
      expect(sentenceCount).toBeLessThanOrEqual(4);
    });

    it('should mention all three APIs', () => {
      const description = generator.generateDescription(sampleAPIs);
      expect(description).toContain('OpenWeather');
      expect(description).toContain('Spotify');
      expect(description).toContain('Google Maps');
    });
  });

  describe('generateFeatures', () => {
    it('should generate 3-5 features', () => {
      const features = generator.generateFeatures(sampleAPIs);
      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThanOrEqual(3);
      expect(features.length).toBeLessThanOrEqual(5);
    });

    it('should reference all three APIs in features', () => {
      const features = generator.generateFeatures(sampleAPIs);
      const allFeatures = features.join(' ');

      // Check that all API names or categories are mentioned
      const hasApi1 = allFeatures.includes('OpenWeather') || allFeatures.includes('weather');
      const hasApi2 = allFeatures.includes('Spotify') || allFeatures.includes('music');
      const hasApi3 = allFeatures.includes('Google Maps') || allFeatures.includes('maps');

      expect(hasApi1).toBe(true);
      expect(hasApi2).toBe(true);
      expect(hasApi3).toBe(true);
    });
  });

  describe('generateRationale', () => {
    it('should generate a non-empty rationale', () => {
      const rationale = generator.generateRationale(sampleAPIs);
      expect(rationale).toBeDefined();
      expect(typeof rationale).toBe('string');
      expect(rationale.length).toBeGreaterThan(0);
    });

    it('should explain API synergy', () => {
      const rationale = generator.generateRationale(sampleAPIs);
      // Should mention at least two of the APIs or their categories
      const mentionCount = [
        'OpenWeather',
        'Spotify',
        'Google Maps',
        'weather',
        'music',
        'maps',
      ].filter((term) => rationale.includes(term)).length;

      expect(mentionCount).toBeGreaterThanOrEqual(2);
    });
  });

  // Feature: mashup-maker, Property 2: Complete App Idea Structure
  // Validates: Requirements 1.3, 1.5
  describe('Property: Complete App Idea Structure', () => {
    it('should generate complete app idea structure for any set of three APIs', () => {
      // Generator for valid auth types
      const authTypeArbitrary = fc.constantFrom('none', 'apikey', 'oauth');

      // Generator for valid API metadata
      const apiMetadataArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        category: fc.string({ minLength: 1, maxLength: 30 }),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 100 }).map(s => '/' + s),
        authType: authTypeArbitrary,
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      // Generator for exactly 3 unique APIs
      const threeAPIsArbitrary = fc.array(apiMetadataArbitrary, { minLength: 3, maxLength: 3 });

      fc.assert(
        fc.property(threeAPIsArbitrary, (apis) => {
          const idea = generator.generateIdea(apis);

          // Verify app name is non-empty
          expect(idea.appName).toBeDefined();
          expect(typeof idea.appName).toBe('string');
          expect(idea.appName.length).toBeGreaterThan(0);

          // Verify description is non-empty
          expect(idea.description).toBeDefined();
          expect(typeof idea.description).toBe('string');
          expect(idea.description.length).toBeGreaterThan(0);

          // Verify features list exists
          expect(idea.features).toBeDefined();
          expect(Array.isArray(idea.features)).toBe(true);
          expect(idea.features.length).toBeGreaterThan(0);

          // Verify rationale is non-empty
          expect(idea.rationale).toBeDefined();
          expect(typeof idea.rationale).toBe('string');
          expect(idea.rationale.length).toBeGreaterThan(0);

          // Verify all three input APIs are referenced
          expect(idea.apis).toBeDefined();
          expect(Array.isArray(idea.apis)).toBe(true);
          expect(idea.apis.length).toBe(3);
          expect(idea.apis).toEqual(apis);
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mashup-maker, Property 17: Description Length Constraint
  // Validates: Requirements 10.2
  describe('Property: Description Length Constraint', () => {
    it('should generate descriptions with 2-4 sentences for any set of three APIs', () => {
      // Generator for valid auth types
      const authTypeArbitrary = fc.constantFrom('none', 'apikey', 'oauth');

      // Generator for valid API metadata
      const apiMetadataArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        category: fc.string({ minLength: 1, maxLength: 30 }),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 100 }).map(s => '/' + s),
        authType: authTypeArbitrary,
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      // Generator for exactly 3 unique APIs
      const threeAPIsArbitrary = fc.array(apiMetadataArbitrary, { minLength: 3, maxLength: 3 });

      fc.assert(
        fc.property(threeAPIsArbitrary, (apis) => {
          const description = generator.generateDescription(apis);

          // Verify description is a non-empty string
          expect(description).toBeDefined();
          expect(typeof description).toBe('string');
          expect(description.length).toBeGreaterThan(0);

          // Count sentences by splitting on periods and filtering non-empty strings
          const sentenceCount = description
            .split('.')
            .filter((s) => s.trim().length > 0).length;

          // Verify sentence count is between 2 and 4
          expect(sentenceCount).toBeGreaterThanOrEqual(2);
          expect(sentenceCount).toBeLessThanOrEqual(4);
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mashup-maker, Property 18: Feature Count and Coverage
  // Validates: Requirements 10.3
  describe('Property: Feature Count and Coverage', () => {
    it('should generate 3-5 features with all three APIs referenced for any set of three APIs', () => {
      // Generator for valid auth types
      const authTypeArbitrary = fc.constantFrom('none', 'apikey', 'oauth');

      // Generator for valid API metadata
      const apiMetadataArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        category: fc.string({ minLength: 1, maxLength: 30 }),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 100 }).map(s => '/' + s),
        authType: authTypeArbitrary,
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      // Generator for exactly 3 unique APIs
      const threeAPIsArbitrary = fc.array(apiMetadataArbitrary, { minLength: 3, maxLength: 3 });

      fc.assert(
        fc.property(threeAPIsArbitrary, (apis) => {
          const features = generator.generateFeatures(apis);

          // Verify features is an array
          expect(features).toBeDefined();
          expect(Array.isArray(features)).toBe(true);

          // Verify feature count is between 3 and 5
          expect(features.length).toBeGreaterThanOrEqual(3);
          expect(features.length).toBeLessThanOrEqual(5);

          // Verify all features are non-empty strings
          features.forEach((feature) => {
            expect(typeof feature).toBe('string');
            expect(feature.length).toBeGreaterThan(0);
          });

          // Verify all three APIs are referenced across the features
          const allFeaturesText = features.join(' ').toLowerCase();
          
          // Check that each API is referenced by either name or category
          const api1Referenced = 
            allFeaturesText.includes(apis[0].name.toLowerCase()) ||
            allFeaturesText.includes(apis[0].category.toLowerCase());
          
          const api2Referenced = 
            allFeaturesText.includes(apis[1].name.toLowerCase()) ||
            allFeaturesText.includes(apis[1].category.toLowerCase());
          
          const api3Referenced = 
            allFeaturesText.includes(apis[2].name.toLowerCase()) ||
            allFeaturesText.includes(apis[2].category.toLowerCase());

          expect(api1Referenced).toBe(true);
          expect(api2Referenced).toBe(true);
          expect(api3Referenced).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
