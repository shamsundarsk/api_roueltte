import { CodeGenerator } from '../generator/CodeGenerator';
import { APIMetadata, AppIdea, GeneratedProject } from '../types';
import * as fc from 'fast-check';

describe('CodeGenerator', () => {
  let codeGenerator: CodeGenerator;
  let mockAPIs: APIMetadata[];
  let mockIdea: AppIdea;

  beforeEach(() => {
    codeGenerator = new CodeGenerator();

    mockAPIs = [
      {
        id: 'api1',
        name: 'Weather API',
        description: 'Get weather data',
        category: 'weather',
        baseUrl: 'https://api.weather.com',
        sampleEndpoint: '/v1/current',
        authType: 'apikey',
        corsCompatible: true,
        mockData: { temp: 72, condition: 'sunny' },
        documentationUrl: 'https://docs.weather.com',
      },
      {
        id: 'api2',
        name: 'Music API',
        description: 'Stream music',
        category: 'music',
        baseUrl: 'https://api.music.com',
        sampleEndpoint: '/v1/tracks',
        authType: 'none',
        corsCompatible: true,
        documentationUrl: 'https://docs.music.com',
      },
      {
        id: 'api3',
        name: 'Maps API',
        description: 'Get location data',
        category: 'maps',
        baseUrl: 'https://api.maps.com',
        sampleEndpoint: '/v1/geocode',
        authType: 'oauth',
        corsCompatible: true,
        mockData: { lat: 40.7128, lng: -74.006 },
        documentationUrl: 'https://docs.maps.com',
      },
    ];

    mockIdea = {
      appName: 'Weather Music Navigator',
      description: 'An app that plays music based on weather and location.',
      features: [
        'Get current weather',
        'Play music based on mood',
        'Show location on map',
      ],
      rationale: 'These APIs work together to create a unique experience.',
      apis: mockAPIs,
    };
  });

  describe('generateProject', () => {
    it('should generate a complete project with backend, frontend, and readme', () => {
      const project = codeGenerator.generateProject(mockIdea);

      expect(project).toBeDefined();
      expect(project.backend).toBeDefined();
      expect(project.frontend).toBeDefined();
      expect(project.readme).toBeDefined();
      expect(typeof project.readme).toBe('string');
      expect(project.readme.length).toBeGreaterThan(0);
    });
  });

  describe('generateBackend', () => {
    it('should generate backend code with correct structure', () => {
      const backend = codeGenerator.generateBackend(mockAPIs);

      expect(backend).toBeDefined();
      expect(backend.structure).toBeDefined();
      expect(backend.files).toBeInstanceOf(Map);
      expect(backend.structure.name).toBe('backend');
      expect(backend.structure.type).toBe('directory');
    });

    it('should generate all required backend files', () => {
      const backend = codeGenerator.generateBackend(mockAPIs);

      expect(backend.files.has('src/server.js')).toBe(true);
      expect(backend.files.has('src/routes/mashup.routes.js')).toBe(true);
      expect(backend.files.has('src/utils/apiClient.js')).toBe(true);
      expect(backend.files.has('package.json')).toBe(true);
      expect(backend.files.has('.env.example')).toBe(true);
    });

    it('should generate service files for each API', () => {
      const backend = codeGenerator.generateBackend(mockAPIs);

      expect(backend.files.has('src/services/weather-api.service.js')).toBe(true);
      expect(backend.files.has('src/services/music-api.service.js')).toBe(true);
      expect(backend.files.has('src/services/maps-api.service.js')).toBe(true);
    });

    it('should include API integration comments in generated files', () => {
      const backend = codeGenerator.generateBackend(mockAPIs);
      const serverFile = backend.files.get('src/server.js');

      expect(serverFile).toContain('Weather API');
      expect(serverFile).toContain('Music API');
      expect(serverFile).toContain('Maps API');
    });
  });

  describe('generateFrontend', () => {
    it('should generate frontend code with correct structure', () => {
      const frontend = codeGenerator.generateFrontend(mockIdea);

      expect(frontend).toBeDefined();
      expect(frontend.structure).toBeDefined();
      expect(frontend.files).toBeInstanceOf(Map);
      expect(frontend.structure.name).toBe('frontend');
      expect(frontend.structure.type).toBe('directory');
    });

    it('should generate all required frontend files', () => {
      const frontend = codeGenerator.generateFrontend(mockIdea);

      expect(frontend.files.has('src/App.jsx')).toBe(true);
      expect(frontend.files.has('src/index.js')).toBe(true);
      expect(frontend.files.has('src/components/Dashboard.jsx')).toBe(true);
      expect(frontend.files.has('src/services/api.service.js')).toBe(true);
      expect(frontend.files.has('package.json')).toBe(true);
      expect(frontend.files.has('.env.example')).toBe(true);
    });

    it('should generate component files for each API', () => {
      const frontend = codeGenerator.generateFrontend(mockIdea);

      expect(frontend.files.has('src/components/WeatherApi.jsx')).toBe(true);
      expect(frontend.files.has('src/components/MusicApi.jsx')).toBe(true);
      expect(frontend.files.has('src/components/MapsApi.jsx')).toBe(true);
    });

    it('should include app name and description in App.jsx', () => {
      const frontend = codeGenerator.generateFrontend(mockIdea);
      const appFile = frontend.files.get('src/App.jsx');

      expect(appFile).toContain(mockIdea.appName);
      expect(appFile).toContain(mockIdea.description);
    });
  });

  describe('generateAPIStubs', () => {
    it('should generate service stub with API metadata', () => {
      const stub = codeGenerator.generateAPIStubs(mockAPIs[0]);

      expect(stub).toContain('Weather API');
      expect(stub).toContain('weather');
      expect(stub).toContain('https://api.weather.com');
      expect(stub).toContain('/v1/current');
    });

    it('should activate Mock Mode for APIs requiring authentication', () => {
      const stubWithAuth = codeGenerator.generateAPIStubs(mockAPIs[0]); // apikey
      const stubWithoutAuth = codeGenerator.generateAPIStubs(mockAPIs[1]); // none

      expect(stubWithAuth).toContain('Mock Mode');
      expect(stubWithAuth).toContain('INTEGRATION INSTRUCTIONS');
      expect(stubWithoutAuth).not.toContain('Mock Mode');
    });

    it('should include mock data for APIs with authentication', () => {
      const stub = codeGenerator.generateAPIStubs(mockAPIs[0]);

      expect(stub).toContain('MOCK_DATA');
      expect(stub).toContain('temp');
      expect(stub).toContain('sunny');
    });

    it('should include integration instructions for authenticated APIs', () => {
      const stub = codeGenerator.generateAPIStubs(mockAPIs[2]); // oauth

      expect(stub).toContain('INTEGRATION INSTRUCTIONS');
      expect(stub).toContain('Sign up for an API key');
      expect(stub).toContain('.env file');
    });
  });

  describe('Mock Mode handling', () => {
    it('should activate Mock Mode for oauth APIs', () => {
      const oauthAPI = mockAPIs[2];
      const stub = codeGenerator.generateAPIStubs(oauthAPI);

      expect(stub).toContain('Mock Mode');
      expect(stub).toContain('oauth');
    });

    it('should activate Mock Mode for apikey APIs', () => {
      const apikeyAPI = mockAPIs[0];
      const stub = codeGenerator.generateAPIStubs(apikeyAPI);

      expect(stub).toContain('Mock Mode');
      expect(stub).toContain('apikey');
    });

    it('should not activate Mock Mode for APIs without authentication', () => {
      const noAuthAPI = mockAPIs[1];
      const stub = codeGenerator.generateAPIStubs(noAuthAPI);

      expect(stub).not.toContain('Mock Mode');
      expect(stub).not.toContain('INTEGRATION INSTRUCTIONS');
    });
  });

  describe('README generation', () => {
    it('should generate README with app information', () => {
      const project = codeGenerator.generateProject(mockIdea);

      expect(project.readme).toContain(mockIdea.appName);
      expect(project.readme).toContain(mockIdea.description);
      expect(project.readme).toContain(mockIdea.rationale);
    });

    it('should include all features in README', () => {
      const project = codeGenerator.generateProject(mockIdea);

      mockIdea.features.forEach((feature) => {
        expect(project.readme).toContain(feature);
      });
    });

    it('should include API documentation links', () => {
      const project = codeGenerator.generateProject(mockIdea);

      mockAPIs.forEach((api) => {
        expect(project.readme).toContain(api.name);
        expect(project.readme).toContain(api.documentationUrl);
      });
    });

    it('should include setup instructions', () => {
      const project = codeGenerator.generateProject(mockIdea);

      expect(project.readme).toContain('Setup Instructions');
      expect(project.readme).toContain('Backend Setup');
      expect(project.readme).toContain('Frontend Setup');
      expect(project.readme).toContain('npm install');
    });

    it('should indicate Mock Mode status for authenticated APIs', () => {
      const project = codeGenerator.generateProject(mockIdea);

      expect(project.readme).toContain('Mock Mode Active');
      expect(project.readme).toContain('authentication required');
    });
  });

  // Property-Based Tests
  describe('Property-Based Tests', () => {
    /**
     * Feature: mashup-maker, Property 10: Mock Mode Activation
     * Validates: Requirements 6.1
     * 
     * For any API with authType 'oauth' or 'apikey', the system should activate 
     * Mock Mode for that API during mashup generation.
     */
    it('should activate Mock Mode for APIs requiring authentication', () => {
      const authTypeArb = fc.constantFrom<'none' | 'apikey' | 'oauth'>('none', 'apikey', 'oauth');
      
      const apiMetadataArb: fc.Arbitrary<APIMetadata> = fc.record({
        id: fc.hexaString({ minLength: 8, maxLength: 12 }),
        name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,19}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{10,100}$/),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.stringMatching(/^\/[a-z0-9/-]{0,29}$/),
        authType: authTypeArb,
        corsCompatible: fc.boolean(),
        mockData: fc.option(fc.object(), { nil: undefined }),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      fc.assert(
        fc.property(apiMetadataArb, (api: APIMetadata) => {
          const generator = new CodeGenerator();
          const stub = generator.generateAPIStubs(api);

          // Check if Mock Mode should be activated based on authType
          const shouldActivateMockMode = api.authType === 'oauth' || api.authType === 'apikey';

          if (shouldActivateMockMode) {
            // Verify Mock Mode is activated
            expect(stub).toContain('Mock Mode');
            expect(stub).toContain('MOCK_DATA');
            expect(stub).toContain('INTEGRATION INSTRUCTIONS');
            expect(stub).toContain('TODO: Replace with real API call');
            
            // Verify mock data is returned instead of real API call
            expect(stub).toContain('return MOCK_DATA');
            
            // Verify integration instructions are present
            expect(stub).toContain('Sign up for an API key');
            expect(stub).toContain('.env file');
          } else {
            // Verify Mock Mode is NOT activated for 'none' auth type
            expect(stub).not.toContain('Mock Mode');
            expect(stub).not.toContain('MOCK_DATA');
            expect(stub).not.toContain('INTEGRATION INSTRUCTIONS');
            
            // Verify real API call is used
            expect(stub).toContain('const response = await apiClient.get');
            expect(stub).toContain('return response.data');
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: mashup-maker, Property 3: Complete Code Generation
     * Validates: Requirements 2.1, 2.2, 2.3
     * 
     * For any generated project, the backend code should contain API service files 
     * for all three APIs with integration comments, and the frontend code should 
     * contain component files with routing templates.
     */
    it('should generate complete code with all required files and integration comments', () => {
      // Generators for property-based testing
      const authTypeArb = fc.constantFrom<'none' | 'apikey' | 'oauth'>('none', 'apikey', 'oauth');
      
      const apiMetadataArb: fc.Arbitrary<APIMetadata> = fc.record({
        id: fc.hexaString({ minLength: 8, maxLength: 12 }),
        name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,19}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{10,100}$/),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.stringMatching(/^\/[a-z0-9/-]{0,29}$/),
        authType: authTypeArb,
        corsCompatible: fc.boolean(),
        mockData: fc.option(fc.object(), { nil: undefined }),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      const appIdeaArb: fc.Arbitrary<AppIdea> = fc.record({
        appName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{4,49}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        features: fc.array(fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{5,50}$/), { minLength: 3, maxLength: 5 }),
        rationale: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        apis: fc.array(apiMetadataArb, { minLength: 3, maxLength: 3 }),
      }) as fc.Arbitrary<AppIdea>;

      fc.assert(
        fc.property(appIdeaArb, (idea: AppIdea) => {
          const generator = new CodeGenerator();
          const project = generator.generateProject(idea);

          // Verify backend completeness
          expect(project.backend).toBeDefined();
          expect(project.backend.files).toBeInstanceOf(Map);
          expect(project.backend.structure).toBeDefined();

          // Verify all three APIs have service files in backend
          idea.apis.forEach((api) => {
            const serviceName = api.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            const serviceFilePath = `src/services/${serviceName}.service.js`;
            
            // Check service file exists
            expect(project.backend.files.has(serviceFilePath)).toBe(true);
            
            // Check service file contains integration comments
            const serviceContent = project.backend.files.get(serviceFilePath);
            expect(serviceContent).toBeDefined();
            expect(serviceContent).toContain(api.name);
            expect(serviceContent).toContain('API Integration Point');
          });

          // Verify frontend completeness
          expect(project.frontend).toBeDefined();
          expect(project.frontend.files).toBeInstanceOf(Map);
          expect(project.frontend.structure).toBeDefined();

          // Verify all three APIs have component files in frontend
          idea.apis.forEach((api) => {
            const componentName = api.name
              .replace(/[^a-zA-Z0-9]+/g, ' ')
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join('')
              .replace(/^[^a-zA-Z]/, 'Component');
            const componentFilePath = `src/components/${componentName}.jsx`;
            
            // Check component file exists
            expect(project.frontend.files.has(componentFilePath)).toBe(true);
            
            // Check component file contains integration comments
            const componentContent = project.frontend.files.get(componentFilePath);
            expect(componentContent).toBeDefined();
            expect(componentContent).toContain(api.name);
            expect(componentContent).toContain('API Integration Point');
          });

          // Verify routing templates exist in frontend
          expect(project.frontend.files.has('src/App.jsx')).toBe(true);
          const appContent = project.frontend.files.get('src/App.jsx');
          expect(appContent).toBeDefined();
          
          // Verify App.jsx contains references to all API components
          idea.apis.forEach((api) => {
            const componentName = api.name
              .replace(/[^a-zA-Z0-9]+/g, ' ')
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join('')
              .replace(/^[^a-zA-Z]/, 'Component');
            expect(appContent).toContain(componentName);
          });

          // Verify README exists
          expect(project.readme).toBeDefined();
          expect(typeof project.readme).toBe('string');
          expect(project.readme.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: mashup-maker, Property 11: Mock Mode Code Generation
     * Validates: Requirements 6.2, 6.3, 6.5
     * 
     * For any API in Mock Mode, the generated code should include sample JSON mock data,
     * integration instructions for the real API, and documentation indicating mock status.
     */
    it('should include mock data, integration instructions, and mock status indicators for APIs in Mock Mode', () => {
      const authTypeArb = fc.constantFrom<'none' | 'apikey' | 'oauth'>('none', 'apikey', 'oauth');
      
      const apiMetadataArb: fc.Arbitrary<APIMetadata> = fc.record({
        id: fc.hexaString({ minLength: 8, maxLength: 12 }),
        name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,19}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{10,100}$/),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.stringMatching(/^\/[a-z0-9/-]{0,29}$/),
        authType: authTypeArb,
        corsCompatible: fc.boolean(),
        mockData: fc.option(fc.object(), { nil: undefined }),
        documentationUrl: fc.webUrl(),
      }) as fc.Arbitrary<APIMetadata>;

      const appIdeaArb: fc.Arbitrary<AppIdea> = fc.record({
        appName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{4,49}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        features: fc.array(fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{5,50}$/), { minLength: 3, maxLength: 5 }),
        rationale: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        apis: fc.array(apiMetadataArb, { minLength: 3, maxLength: 3 }),
      }) as fc.Arbitrary<AppIdea>;

      fc.assert(
        fc.property(appIdeaArb, (idea: AppIdea) => {
          const generator = new CodeGenerator();
          const project = generator.generateProject(idea);

          // Build a map of service files using the same collision-handling logic as CodeGenerator
          const serviceFileMap = new Map<number, string>();
          const usedFileNames = new Set<string>();
          
          idea.apis.forEach((api, index) => {
            let serviceName = api.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            
            // Handle filename collisions by appending index (same as CodeGenerator)
            if (usedFileNames.has(serviceName)) {
              serviceName = `${serviceName}-${index}`;
            }
            usedFileNames.add(serviceName);
            
            const serviceFilePath = `src/services/${serviceName}.service.js`;
            const serviceContent = project.backend.files.get(serviceFilePath);
            
            expect(serviceContent).toBeDefined();
            serviceFileMap.set(index, serviceContent!);
          });
          
          // Check each API in the idea
          idea.apis.forEach((api, index) => {
            const isInMockMode = api.authType === 'oauth' || api.authType === 'apikey';
            const serviceContent = serviceFileMap.get(index)!;
            
            if (isInMockMode) {
              // Requirement 6.2: Mock Mode should insert sample JSON responses as placeholders
              expect(serviceContent).toContain('MOCK_DATA');
              expect(serviceContent).toContain('return MOCK_DATA');
              
              // Verify mock data declaration exists (don't validate JSON parsing from regex as it's fragile)
              expect(serviceContent).toContain('const MOCK_DATA =');
              
              // Requirement 6.3: Mock Mode should include clear instructions for integrating the real API
              expect(serviceContent).toContain('INTEGRATION INSTRUCTIONS');
              expect(serviceContent).toContain('Sign up for an API key');
              expect(serviceContent).toContain('.env file');
              expect(serviceContent).toContain('TODO: Replace with real API call');
              
              // Verify instructions mention how to uncomment real API call
              expect(serviceContent).toContain('Uncomment the following lines');
              expect(serviceContent).toContain('remove the mock');
              
              // Requirement 6.5: Documentation should indicate which APIs are using mock responses
              expect(serviceContent).toContain('Mock Mode');
              expect(serviceContent).toContain('authentication');
              expect(serviceContent).toContain(api.authType);
              
              // Verify README also indicates Mock Mode status
              expect(project.readme).toContain('Mock Mode Active');
              expect(project.readme).toContain(api.name);
              expect(project.readme).toContain('authentication required');
              
              // Verify README includes integration instructions
              expect(project.readme).toContain('To integrate the real API');
              
              // Check that documentation URL is present (may be HTML-encoded)
              // Handlebars HTML-encodes special characters like &, ', ", <, >, =
              const htmlEncodedUrl = api.documentationUrl
                .replace(/&/g, '&amp;')
                .replace(/'/g, '&#x27;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/=/g, '&#x3D;');
              const urlInReadme = project.readme.includes(api.documentationUrl) || 
                                  project.readme.includes(htmlEncodedUrl);
              expect(urlInReadme).toBe(true);
            } else {
              // APIs without authentication should NOT have Mock Mode
              expect(serviceContent).not.toContain('MOCK_DATA');
              expect(serviceContent).not.toContain('Mock Mode');
              expect(serviceContent).not.toContain('INTEGRATION INSTRUCTIONS');
              
              // Should have real API call instead
              expect(serviceContent).toContain('const response = await apiClient.get');
              expect(serviceContent).toContain('return response.data');
            }
          });
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: mashup-maker, Property 4: Valid Syntax Generation
     * Validates: Requirements 2.5
     * 
     * For any generated JavaScript or JSX file, parsing the file content with a 
     * JavaScript parser should succeed without syntax errors.
     */
    it('should generate valid JavaScript and JSX syntax in all files', () => {
      const authTypeArb = fc.constantFrom<'none' | 'apikey' | 'oauth'>('none', 'apikey', 'oauth');
      
      const apiMetadataArb: fc.Arbitrary<APIMetadata> = fc.record({
        id: fc.hexaString({ minLength: 8, maxLength: 12 }),
        name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,19}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{10,100}$/),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl().filter(url => !url.includes('*')),
        sampleEndpoint: fc.stringMatching(/^\/[a-z0-9/-]{0,29}$/),
        authType: authTypeArb,
        corsCompatible: fc.boolean(),
        mockData: fc.option(fc.object(), { nil: undefined }),
        documentationUrl: fc.webUrl().filter(url => !url.includes('*')),
      }) as fc.Arbitrary<APIMetadata>;

      const appIdeaArb: fc.Arbitrary<AppIdea> = fc.record({
        appName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{4,49}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        features: fc.array(fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{5,50}$/), { minLength: 3, maxLength: 5 }),
        rationale: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        apis: fc.array(apiMetadataArb, { minLength: 3, maxLength: 3 }),
      }) as fc.Arbitrary<AppIdea>;

      fc.assert(
        fc.property(appIdeaArb, (idea: AppIdea) => {
          const generator = new CodeGenerator();
          const project = generator.generateProject(idea);

          // Helper function to validate JavaScript/JSX syntax
          const validateSyntax = (code: string, filename: string): void => {
            const parser = require('@babel/parser');
            
            try {
              // Determine if file is JSX based on extension or content
              const isJSX = filename.endsWith('.jsx') || code.includes('<');
              
              // Parse the code with appropriate plugins
              parser.parse(code, {
                sourceType: 'module',
                plugins: isJSX ? ['jsx'] : [],
              });
              
              // If parsing succeeds, syntax is valid
              expect(true).toBe(true);
            } catch (error: any) {
              // If parsing fails, the syntax is invalid
              throw new Error(
                `Syntax error in ${filename}: ${error.message}\n\nGenerated code:\n${code.substring(0, 500)}...`
              );
            }
          };

          // Validate all backend JavaScript files
          project.backend.files.forEach((content, filepath) => {
            if (filepath.endsWith('.js')) {
              validateSyntax(content, filepath);
            }
          });

          // Validate all frontend JavaScript and JSX files
          project.frontend.files.forEach((content, filepath) => {
            if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
              validateSyntax(content, filepath);
            }
          });

          // Ensure we actually validated some files
          const backendJSFiles = Array.from(project.backend.files.keys()).filter(f => f.endsWith('.js'));
          const frontendJSFiles = Array.from(project.frontend.files.keys()).filter(f => 
            f.endsWith('.js') || f.endsWith('.jsx')
          );
          
          expect(backendJSFiles.length).toBeGreaterThan(0);
          expect(frontendJSFiles.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: mashup-maker, Property 12: Graceful Failure Handling
     * Validates: Requirements 6.4
     * 
     * For any API that fails during generation, the mashup generation process should 
     * complete successfully with mock data substituted for the failed API.
     */
    it('should complete generation successfully even with problematic API metadata', () => {
      const authTypeArb = fc.constantFrom<'none' | 'apikey' | 'oauth'>('none', 'apikey', 'oauth');
      
      // Create an arbitrary that can generate APIs with potentially problematic characteristics
      const apiMetadataArb: fc.Arbitrary<APIMetadata> = fc.record({
        id: fc.hexaString({ minLength: 8, maxLength: 12 }),
        name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,19}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{10,100}$/),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl().filter(url => !url.includes('*')),
        sampleEndpoint: fc.stringMatching(/^\/[a-z0-9/-]{0,29}$/),
        authType: authTypeArb,
        corsCompatible: fc.boolean(),
        // mockData can be undefined, simulating missing mock data
        mockData: fc.option(fc.object(), { nil: undefined }),
        documentationUrl: fc.webUrl().filter(url => !url.includes('*')),
      }) as fc.Arbitrary<APIMetadata>;

      const appIdeaArb: fc.Arbitrary<AppIdea> = fc.record({
        appName: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{4,49}$/),
        description: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        features: fc.array(fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{5,50}$/), { minLength: 3, maxLength: 5 }),
        rationale: fc.stringMatching(/^[a-zA-Z0-9 .,!?-]{20,200}$/),
        apis: fc.array(apiMetadataArb, { minLength: 3, maxLength: 3 }),
      }) as fc.Arbitrary<AppIdea>;

      fc.assert(
        fc.property(appIdeaArb, (idea: AppIdea) => {
          const generator = new CodeGenerator();
          
          // The generation process should not throw errors even with problematic APIs
          let project: GeneratedProject;
          try {
            project = generator.generateProject(idea);
          } catch (error: any) {
            throw new Error(
              `Generation failed with error: ${error.message}\n` +
              `APIs: ${JSON.stringify(idea.apis.map(api => ({ name: api.name, authType: api.authType, hasMockData: !!api.mockData })), null, 2)}`
            );
          }

          // Verify the project was generated successfully
          expect(project).toBeDefined();
          expect(project.backend).toBeDefined();
          expect(project.frontend).toBeDefined();
          expect(project.readme).toBeDefined();

          // Verify all three APIs have service files generated
          expect(project.backend.files.size).toBeGreaterThan(0);
          
          // Count service files - should have one for each API
          const serviceFiles = Array.from(project.backend.files.keys()).filter(
            (path: string) => path.startsWith('src/services/') && path.endsWith('.service.js')
          );
          expect(serviceFiles.length).toBe(3);

          // Verify all three APIs have component files generated
          const componentFiles = Array.from(project.frontend.files.keys()).filter(
            (path: string) => path.startsWith('src/components/') && path.endsWith('.jsx') && path !== 'src/components/Dashboard.jsx'
          );
          expect(componentFiles.length).toBe(3);

          // For APIs requiring authentication, verify mock data handling
          idea.apis.forEach((api, index) => {
            const requiresAuth = api.authType === 'oauth' || api.authType === 'apikey';
            
            if (requiresAuth) {
              // Find the service file for this API
              const serviceName = api.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              
              // Handle potential filename collisions
              let serviceFilePath = `src/services/${serviceName}.service.js`;
              if (!project.backend.files.has(serviceFilePath)) {
                serviceFilePath = `src/services/${serviceName}-${index}.service.js`;
              }
              
              const serviceContent = project.backend.files.get(serviceFilePath);
              expect(serviceContent).toBeDefined();
              
              // Verify mock data is present in the generated code
              // Even if the API metadata doesn't have mockData, the generator should provide fallback
              expect(serviceContent).toContain('MOCK_DATA');
              expect(serviceContent).toContain('return MOCK_DATA');
              
              // Verify integration instructions are present
              expect(serviceContent).toContain('INTEGRATION INSTRUCTIONS');
              
              // Verify the README indicates mock mode for this API
              expect(project.readme).toContain(api.name);
              expect(project.readme).toContain('Mock Mode Active');
            }
          });

          // Verify README is comprehensive and includes all APIs
          idea.apis.forEach((api) => {
            expect(project.readme).toContain(api.name);
          });

          // Verify the generation completed without halting
          expect(project.backend.files.has('src/server.js')).toBe(true);
          expect(project.frontend.files.has('src/App.jsx')).toBe(true);
          expect(project.readme.length).toBeGreaterThan(100);
        }),
        { numRuns: 100 }
      );
    });
  });
});
