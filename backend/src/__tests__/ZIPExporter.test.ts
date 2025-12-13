import { ZIPExporter } from '../exporter/ZIPExporter';
import { AppIdea, APIMetadata } from '../types/api.types';
import fs from 'fs-extra';

describe('ZIPExporter', () => {
  let zipExporter: ZIPExporter;
  const testTempDir = '/tmp/api-roulette-test';

  beforeEach(() => {
    zipExporter = new ZIPExporter(testTempDir);
  });

  afterEach(async () => {
    // Clean up test files
    if (await fs.pathExists(testTempDir)) {
      await fs.remove(testTempDir);
    }
  });

  describe('HTML Generation', () => {
    it('should generate HTML with combined idea focus', () => {
      const mockAPIs: APIMetadata[] = [
        {
          id: 'weather-api',
          name: 'Weather API',
          description: 'Provides current weather data',
          category: 'weather',
          baseUrl: 'https://api.weather.com',
          sampleEndpoint: '/v1/current',
          authType: 'apikey',
          corsCompatible: true,
          documentationUrl: 'https://docs.weather.com'
        },
        {
          id: 'news-api',
          name: 'News API',
          description: 'Delivers latest news articles',
          category: 'news',
          baseUrl: 'https://api.news.com',
          sampleEndpoint: '/v1/articles',
          authType: 'none',
          corsCompatible: true,
          documentationUrl: 'https://docs.news.com'
        },
        {
          id: 'location-api',
          name: 'Location API',
          description: 'Provides geolocation services',
          category: 'location',
          baseUrl: 'https://api.location.com',
          sampleEndpoint: '/v1/geocode',
          authType: 'oauth',
          corsCompatible: false,
          documentationUrl: 'https://docs.location.com'
        }
      ];

      const mockIdea: AppIdea = {
        appName: 'WeatherNews Hub',
        description: 'A location-aware news and weather dashboard that combines real-time weather data with location-specific news to provide users with contextual information about their area.',
        features: [
          'Real-time weather updates for any location',
          'Location-based news filtering',
          'Interactive weather and news dashboard',
          'Personalized content recommendations'
        ],
        rationale: 'By combining weather, news, and location APIs, users get a comprehensive view of what\'s happening in their area both environmentally and socially. The weather API provides current conditions, the location API enables precise geographic targeting, and the news API delivers relevant local stories.',
        apis: mockAPIs
      };

      // Access the private method through type assertion for testing
      const html = (zipExporter as any).generateIndexHtml(mockIdea);

      // Verify the HTML contains the new combined idea focus
      expect(html).toContain('AI-Generated App Concept');
      expect(html).toContain('What is API Roulette?');
      expect(html).toContain('The Combined Idea');
      expect(html).toContain('Why These APIs Were Selected');
      expect(html).toContain('How These APIs Work Together');
      expect(html).toContain('The Final Result');
      
      // Verify it contains the app-specific content
      expect(html).toContain('WeatherNews Hub');
      expect(html).toContain('location-aware news and weather dashboard');
      expect(html).toContain('Weather API');
      expect(html).toContain('News API');
      expect(html).toContain('Location API');
      
      // Verify it explains the combination
      expect(html).toContain('Primary Role');
      expect(html).toContain('Contribution to WeatherNews Hub');
      
      // Verify modern styling is present
      expect(html).toContain('api-combination');
      expect(html).toContain('final-concept');
      expect(html).toContain('hero-section');
    });

    it('should handle mock mode correctly', () => {
      const mockAPIsWithAuth: APIMetadata[] = [
        {
          id: 'auth-api',
          name: 'Auth Required API',
          description: 'Requires authentication',
          category: 'data',
          baseUrl: 'https://api.auth.com',
          sampleEndpoint: '/v1/data',
          authType: 'apikey',
          corsCompatible: true,
          documentationUrl: 'https://docs.auth.com'
        }
      ];

      const mockIdea: AppIdea = {
        appName: 'Test App',
        description: 'A test application',
        features: ['Test feature'],
        rationale: 'Test rationale',
        apis: mockAPIsWithAuth
      };

      const html = (zipExporter as any).generateIndexHtml(mockIdea);

      expect(html).toContain('Development Mode Notice');
      expect(html).toContain('mock data for immediate testing');
    });

    it('should generate API contribution explanations', () => {
      const mockAPI: APIMetadata = {
        id: 'test-api',
        name: 'Test API',
        description: 'A test API',
        category: 'testing',
        baseUrl: 'https://api.test.com',
        sampleEndpoint: '/v1/test',
        authType: 'none',
        corsCompatible: true,
        documentationUrl: 'https://docs.test.com'
      };

      const mockIdea: AppIdea = {
        appName: 'Test App',
        description: 'An app that combines multiple data sources to provide comprehensive insights.',
        features: ['Feature 1'],
        rationale: 'Test rationale',
        apis: [mockAPI]
      };

      const contribution = (zipExporter as any).generateApiContribution(mockAPI, mockIdea, 0);
      
      expect(contribution).toContain('Test App');
      expect(typeof contribution).toBe('string');
      expect(contribution.length).toBeGreaterThan(10);
    });
  });
});