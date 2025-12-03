import { UILayoutSuggester } from '../generator/UILayoutSuggester';
import { APIMetadata, AppIdea } from '../types/api.types';
import * as fc from 'fast-check';

describe('UILayoutSuggester', () => {
  let suggester: UILayoutSuggester;

  beforeEach(() => {
    suggester = new UILayoutSuggester();
  });

  const createMockAPI = (
    id: string,
    name: string,
    category: string,
    description: string
  ): APIMetadata => ({
    id,
    name,
    description,
    category,
    baseUrl: `https://api.${id}.com`,
    sampleEndpoint: '/v1/data',
    authType: 'none',
    corsCompatible: true,
    documentationUrl: `https://docs.${id}.com`,
  });

  const createMockAppIdea = (apis: APIMetadata[]): AppIdea => ({
    appName: 'Test App',
    description: 'A test application',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    rationale: 'These APIs work well together',
    apis,
  });

  describe('generateLayout', () => {
    it('should generate complete UI layout with all required components', () => {
      const apis = [
        createMockAPI('weather', 'Weather API', 'weather', 'Get weather data'),
        createMockAPI('music', 'Music API', 'music', 'Stream music'),
        createMockAPI('maps', 'Maps API', 'maps', 'Display maps'),
      ];
      const idea = createMockAppIdea(apis);

      const layout = suggester.generateLayout(idea);

      expect(layout).toBeDefined();
      expect(layout.screens).toBeDefined();
      expect(layout.components).toBeDefined();
      expect(layout.interactionFlow).toBeDefined();
    });

    it('should reference all three APIs in the layout', () => {
      const apis = [
        createMockAPI('weather', 'Weather API', 'weather', 'Get weather data'),
        createMockAPI('music', 'Music API', 'music', 'Stream music'),
        createMockAPI('maps', 'Maps API', 'maps', 'Display maps'),
      ];
      const idea = createMockAppIdea(apis);

      const layout = suggester.generateLayout(idea);

      // Check that all APIs are referenced in components
      const apiNames = apis.map((api) => api.name);
      const componentAPIs = layout.components.map((c) => c.apiSource);

      apiNames.forEach((apiName) => {
        expect(componentAPIs).toContain(apiName);
      });
    });
  });

  describe('suggestScreens', () => {
    it('should suggest 2-4 screens for three APIs', () => {
      const apis = [
        createMockAPI('weather', 'Weather API', 'weather', 'Get weather data'),
        createMockAPI('music', 'Music API', 'music', 'Stream music'),
        createMockAPI('maps', 'Maps API', 'maps', 'Display maps'),
      ];

      const screens = suggester.suggestScreens(apis);

      expect(screens.length).toBeGreaterThanOrEqual(2);
      expect(screens.length).toBeLessThanOrEqual(4);
    });

    it('should include a Dashboard screen', () => {
      const apis = [
        createMockAPI('weather', 'Weather API', 'weather', 'Get weather data'),
        createMockAPI('music', 'Music API', 'music', 'Stream music'),
      ];

      const screens = suggester.suggestScreens(apis);

      const hasDashboard = screens.some((screen) => screen.name === 'Dashboard');
      expect(hasDashboard).toBe(true);
    });

    it('should create screens with name, description, and components', () => {
      const apis = [createMockAPI('weather', 'Weather API', 'weather', 'Get weather data')];

      const screens = suggester.suggestScreens(apis);

      screens.forEach((screen) => {
        expect(screen.name).toBeDefined();
        expect(typeof screen.name).toBe('string');
        expect(screen.name.length).toBeGreaterThan(0);

        expect(screen.description).toBeDefined();
        expect(typeof screen.description).toBe('string');
        expect(screen.description.length).toBeGreaterThan(0);

        expect(screen.components).toBeDefined();
        expect(Array.isArray(screen.components)).toBe(true);
        expect(screen.components.length).toBeGreaterThan(0);
      });
    });
  });

  describe('suggestComponents', () => {
    it('should suggest components for all APIs', () => {
      const apis = [
        createMockAPI('weather', 'Weather API', 'weather', 'Get weather data'),
        createMockAPI('music', 'Music API', 'music', 'Stream music'),
        createMockAPI('maps', 'Maps API', 'maps', 'Display maps'),
      ];

      const components = suggester.suggestComponents(apis);

      expect(components.length).toBeGreaterThan(0);

      // Each API should have at least one component
      apis.forEach((api) => {
        const hasComponent = components.some((c) => c.apiSource === api.name);
        expect(hasComponent).toBe(true);
      });
    });

    it('should map API categories to appropriate component types', () => {
      const apis = [
        createMockAPI('weather', 'Weather API', 'weather', 'Get weather data'),
        createMockAPI('music', 'Music API', 'music', 'Stream music'),
        createMockAPI('maps', 'Maps API', 'maps', 'Display maps'),
      ];

      const components = suggester.suggestComponents(apis);

      // Weather should have cards, lists, or charts
      const weatherComponents = components.filter((c) => c.apiSource === 'Weather API');
      expect(weatherComponents.length).toBeGreaterThan(0);

      // Music should have player component
      const musicComponents = components.filter((c) => c.apiSource === 'Music API');
      const hasPlayer = musicComponents.some((c) => c.type === 'player');
      expect(hasPlayer).toBe(true);

      // Maps should have map component
      const mapComponents = components.filter((c) => c.apiSource === 'Maps API');
      const hasMap = mapComponents.some((c) => c.type === 'map');
      expect(hasMap).toBe(true);
    });

    it('should include type and purpose for each component', () => {
      const apis = [createMockAPI('weather', 'Weather API', 'weather', 'Get weather data')];

      const components = suggester.suggestComponents(apis);

      components.forEach((component) => {
        expect(component.type).toBeDefined();
        expect(['card', 'list', 'chart', 'form', 'map', 'player']).toContain(component.type);

        expect(component.purpose).toBeDefined();
        expect(typeof component.purpose).toBe('string');
        expect(component.purpose.length).toBeGreaterThan(0);

        expect(component.apiSource).toBeDefined();
        expect(typeof component.apiSource).toBe('string');
      });
    });
  });

  describe('suggestInteractionFlow', () => {
    it('should describe navigation between screens', () => {
      const screens = [
        {
          name: 'Dashboard',
          description: 'Main screen',
          components: ['Nav'],
        },
        {
          name: 'Weather Screen',
          description: 'Weather screen',
          components: ['Weather Card'],
        },
        {
          name: 'Music Screen',
          description: 'Music screen',
          components: ['Player'],
        },
      ];

      const flow = suggester.suggestInteractionFlow(screens);

      expect(flow).toBeDefined();
      expect(flow.steps).toBeDefined();
      expect(Array.isArray(flow.steps)).toBe(true);
      expect(flow.steps.length).toBeGreaterThan(0);
    });

    it('should include from, to, and action for each flow step', () => {
      const screens = [
        {
          name: 'Dashboard',
          description: 'Main screen',
          components: ['Nav'],
        },
        {
          name: 'Weather Screen',
          description: 'Weather screen',
          components: ['Weather Card'],
        },
      ];

      const flow = suggester.suggestInteractionFlow(screens);

      flow.steps.forEach((step) => {
        expect(step.from).toBeDefined();
        expect(typeof step.from).toBe('string');

        expect(step.to).toBeDefined();
        expect(typeof step.to).toBe('string');

        expect(step.action).toBeDefined();
        expect(typeof step.action).toBe('string');
        expect(step.action.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty screens array', () => {
      const flow = suggester.suggestInteractionFlow([]);

      expect(flow).toBeDefined();
      expect(flow.steps).toBeDefined();
      expect(flow.steps.length).toBe(0);
    });
  });

  // Feature: mashup-maker, Property 7: Complete UI Layout Suggestions
  // Validates: Requirements 4.1, 4.2, 4.3, 4.4
  describe('Property: Complete UI Layout Suggestions', () => {
    it('should generate complete UI layout with screens, components, flow, and all APIs referenced for any app idea', () => {
      // Generator for valid auth types
      const authTypeArbitrary = fc.constantFrom('none', 'apikey', 'oauth');

      // Generator for valid API metadata
      const apiMetadataArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        category: fc.string({ minLength: 1, maxLength: 30 }),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 100 }).map((s) => '/' + s),
        authType: authTypeArbitrary,
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      // Generator for exactly 3 unique APIs
      const threeAPIsArbitrary = fc.array(apiMetadataArbitrary, { minLength: 3, maxLength: 3 });

      // Generator for app idea
      const appIdeaArbitrary = threeAPIsArbitrary.chain((apis) =>
        fc.record({
          appName: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          features: fc.array(fc.string({ minLength: 1, maxLength: 200 }), {
            minLength: 3,
            maxLength: 5,
          }),
          rationale: fc.string({ minLength: 10, maxLength: 500 }),
          apis: fc.constant(apis),
        })
      ) as fc.Arbitrary<AppIdea>;

      fc.assert(
        fc.property(appIdeaArbitrary, (idea) => {
          const layout = suggester.generateLayout(idea);

          // Requirement 4.1: Verify screen descriptions are provided
          expect(layout.screens).toBeDefined();
          expect(Array.isArray(layout.screens)).toBe(true);
          expect(layout.screens.length).toBeGreaterThanOrEqual(2);
          expect(layout.screens.length).toBeLessThanOrEqual(4);

          // Each screen should have name, description, and components
          layout.screens.forEach((screen) => {
            expect(screen.name).toBeDefined();
            expect(typeof screen.name).toBe('string');
            expect(screen.name.length).toBeGreaterThan(0);

            expect(screen.description).toBeDefined();
            expect(typeof screen.description).toBe('string');
            expect(screen.description.length).toBeGreaterThan(0);

            expect(screen.components).toBeDefined();
            expect(Array.isArray(screen.components)).toBe(true);
            expect(screen.components.length).toBeGreaterThan(0);
          });

          // Requirement 4.2: Verify component types are specified
          expect(layout.components).toBeDefined();
          expect(Array.isArray(layout.components)).toBe(true);
          expect(layout.components.length).toBeGreaterThan(0);

          // Each component should have type, purpose, and apiSource
          layout.components.forEach((component) => {
            expect(component.type).toBeDefined();
            expect(['card', 'list', 'chart', 'form', 'map', 'player']).toContain(component.type);

            expect(component.purpose).toBeDefined();
            expect(typeof component.purpose).toBe('string');
            expect(component.purpose.length).toBeGreaterThan(0);

            expect(component.apiSource).toBeDefined();
            expect(typeof component.apiSource).toBe('string');
            expect(component.apiSource.length).toBeGreaterThan(0);
          });

          // Requirement 4.3: Verify interaction flow is described
          expect(layout.interactionFlow).toBeDefined();
          expect(layout.interactionFlow.steps).toBeDefined();
          expect(Array.isArray(layout.interactionFlow.steps)).toBe(true);

          // Each flow step should have from, to, and action
          layout.interactionFlow.steps.forEach((step) => {
            expect(step.from).toBeDefined();
            expect(typeof step.from).toBe('string');
            expect(step.from.length).toBeGreaterThan(0);

            expect(step.to).toBeDefined();
            expect(typeof step.to).toBe('string');
            expect(step.to.length).toBeGreaterThan(0);

            expect(step.action).toBeDefined();
            expect(typeof step.action).toBe('string');
            expect(step.action.length).toBeGreaterThan(0);
          });

          // Requirement 4.4: Verify all three APIs are referenced in layout suggestions
          const apiNames = idea.apis.map((api) => api.name);
          const componentAPIs = layout.components.map((c) => c.apiSource);

          apiNames.forEach((apiName) => {
            expect(componentAPIs).toContain(apiName);
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
