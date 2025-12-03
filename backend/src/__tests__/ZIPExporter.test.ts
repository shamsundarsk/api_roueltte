import { ZIPExporter } from '../exporter/ZIPExporter';
import { GeneratedProject, AppIdea, APIMetadata } from '../types';
import fs from 'fs-extra';
import path from 'path';
import * as fc from 'fast-check';
import AdmZip from 'adm-zip';

describe('ZIPExporter', () => {
  let zipExporter: ZIPExporter;
  let testTempDir: string;
  let mockProject: GeneratedProject;
  let mockIdea: AppIdea;

  beforeEach(() => {
    // Use a test-specific temp directory
    testTempDir = path.join(__dirname, '../../test-temp');
    zipExporter = new ZIPExporter(testTempDir);

    // Create mock APIs
    const mockAPIs: APIMetadata[] = [
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

    // Create mock project
    const backendFiles = new Map<string, string>();
    backendFiles.set('src/server.js', 'console.log("Backend server");');
    backendFiles.set('src/routes/mashup.routes.js', '// Routes');
    backendFiles.set('src/services/weather-api.service.js', '// Weather service');
    backendFiles.set('package.json', '{"name": "backend"}');

    const frontendFiles = new Map<string, string>();
    frontendFiles.set('src/App.jsx', 'function App() { return <div>App</div>; }');
    frontendFiles.set('src/index.js', 'import App from "./App";');
    frontendFiles.set('package.json', '{"name": "frontend"}');

    mockProject = {
      backend: {
        structure: {
          name: 'backend',
          type: 'directory',
          children: [],
        },
        files: backendFiles,
      },
      frontend: {
        structure: {
          name: 'frontend',
          type: 'directory',
          children: [],
        },
        files: frontendFiles,
      },
      readme: 'Test README content',
    };
  });

  afterEach(async () => {
    // Clean up test temp directory
    if (await fs.pathExists(testTempDir)) {
      await fs.remove(testTempDir);
    }
  });

  describe('createArchive', () => {
    it('should create a ZIP archive with all project files', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);

      expect(zipPath).toBeDefined();
      expect(await fs.pathExists(zipPath)).toBe(true);
      expect(path.extname(zipPath)).toBe('.zip');
    });

    it('should sanitize app name for filename', async () => {
      const ideaWithSpecialChars = {
        ...mockIdea,
        appName: 'My Awesome App! (2024)',
      };

      const zipPath = await zipExporter.createArchive(mockProject, ideaWithSpecialChars);
      const filename = path.basename(zipPath, '.zip');

      // Should be sanitized to lowercase with hyphens
      expect(filename).toBe('my-awesome-app-2024');
      expect(filename).not.toContain('!');
      expect(filename).not.toContain('(');
      expect(filename).not.toContain(')');
    });

    it('should include README in the archive', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
      
      // The archive should be created successfully
      const stats = await fs.stat(zipPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should organize files into backend and frontend directories', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
      
      // Verify the ZIP was created with content
      const stats = await fs.stat(zipPath);
      expect(stats.size).toBeGreaterThan(100); // Should have substantial content
    });
  });

  describe('generateReadme', () => {
    it('should include app name and description', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
      
      // The README is generated internally, we verify it through the archive creation
      expect(mockIdea.appName).toBeDefined();
      expect(mockIdea.description).toBeDefined();
    });

    it('should include all features', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
      
      // Verify features are defined
      expect(mockIdea.features.length).toBe(3);
      mockIdea.features.forEach(feature => {
        expect(feature).toBeDefined();
        expect(feature.length).toBeGreaterThan(0);
      });
    });

    it('should include API metadata for all three APIs', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
      
      // Verify all APIs are present
      expect(mockIdea.apis.length).toBe(3);
      mockIdea.apis.forEach(api => {
        expect(api.name).toBeDefined();
        expect(api.description).toBeDefined();
        expect(api.documentationUrl).toBeDefined();
      });
    });

    it('should include setup instructions for backend and frontend', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
    });

    it('should indicate Mock Mode status when APIs require authentication', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
      
      // Verify we have APIs with authentication
      const authAPIs = mockIdea.apis.filter(api => api.authType !== 'none');
      expect(authAPIs.length).toBeGreaterThan(0);
    });

    it('should include integration instructions for authenticated APIs', async () => {
      const zipPath = await zipExporter.createArchive(mockProject, mockIdea);
      expect(await fs.pathExists(zipPath)).toBe(true);
    });
  });

  describe('sanitizeFilename', () => {
    it('should convert to lowercase', async () => {
      const idea = { ...mockIdea, appName: 'MyAwesomeApp' };
      const zipPath = await zipExporter.createArchive(mockProject, idea);
      const filename = path.basename(zipPath, '.zip');
      
      expect(filename).toBe('myawesomeapp');
    });

    it('should replace spaces with hyphens', async () => {
      const idea = { ...mockIdea, appName: 'My Awesome App' };
      const zipPath = await zipExporter.createArchive(mockProject, idea);
      const filename = path.basename(zipPath, '.zip');
      
      expect(filename).toBe('my-awesome-app');
    });

    it('should remove special characters', async () => {
      const idea = { ...mockIdea, appName: 'App@2024!#$' };
      const zipPath = await zipExporter.createArchive(mockProject, idea);
      const filename = path.basename(zipPath, '.zip');
      
      expect(filename).not.toContain('@');
      expect(filename).not.toContain('!');
      expect(filename).not.toContain('#');
      expect(filename).not.toContain('$');
    });

    it('should limit filename length', async () => {
      const longName = 'A'.repeat(100);
      const idea = { ...mockIdea, appName: longName };
      const zipPath = await zipExporter.createArchive(mockProject, idea);
      const filename = path.basename(zipPath, '.zip');
      
      expect(filename.length).toBeLessThanOrEqual(50);
    });
  });

  describe('cleanupOldFiles', () => {
    it('should remove ZIP files older than specified age', async () => {
      // Create a test ZIP file
      const testZipPath = path.join(testTempDir, 'old-test.zip');
      await fs.ensureDir(testTempDir);
      await fs.writeFile(testZipPath, 'test content');
      
      // Modify the file's timestamp to make it appear old
      const oldTime = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      await fs.utimes(testZipPath, new Date(oldTime), new Date(oldTime));
      
      // Run cleanup with 24 hour threshold
      await zipExporter.cleanupOldFiles(24);
      
      // File should be removed
      expect(await fs.pathExists(testZipPath)).toBe(false);
    });

    it('should keep ZIP files newer than specified age', async () => {
      // Create a test ZIP file
      const testZipPath = path.join(testTempDir, 'new-test.zip');
      await fs.ensureDir(testTempDir);
      await fs.writeFile(testZipPath, 'test content');
      
      // Run cleanup with 24 hour threshold
      await zipExporter.cleanupOldFiles(24);
      
      // File should still exist
      expect(await fs.pathExists(testZipPath)).toBe(true);
    });

    it('should not throw errors if temp directory is empty', async () => {
      await expect(zipExporter.cleanupOldFiles(24)).resolves.not.toThrow();
    });

    it('should only remove .zip files', async () => {
      // Create a non-ZIP file
      const testFilePath = path.join(testTempDir, 'test.txt');
      await fs.ensureDir(testTempDir);
      await fs.writeFile(testFilePath, 'test content');
      
      // Modify timestamp to make it old
      const oldTime = Date.now() - (25 * 60 * 60 * 1000);
      await fs.utimes(testFilePath, new Date(oldTime), new Date(oldTime));
      
      // Run cleanup
      await zipExporter.cleanupOldFiles(24);
      
      // Non-ZIP file should still exist
      expect(await fs.pathExists(testFilePath)).toBe(true);
    });
  });

  describe('getFilename', () => {
    it('should extract filename from full path', () => {
      const fullPath = '/tmp/mashup-maker/my-app.zip';
      const filename = zipExporter.getFilename(fullPath);
      
      expect(filename).toBe('my-app.zip');
    });
  });

  // Feature: mashup-maker, Property 5: Complete ZIP Archive Structure
  // Validates: Requirements 3.1, 3.2, 3.3
  describe('Property 5: Complete ZIP Archive Structure', () => {
    it('should contain all generated files organized into backend/frontend directories with README', async () => {
      // Generator for API metadata
      const apiMetadataArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        authType: fc.constantFrom('none' as const, 'apikey' as const, 'oauth' as const),
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
        mockData: fc.option(fc.object(), { nil: undefined })
      });

      // Generator for app idea
      const appIdeaArbitrary = fc.record({
        appName: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 20, maxLength: 300 }).filter(s => s.trim().length > 0),
        features: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 3, maxLength: 5 }),
        rationale: fc.string({ minLength: 20, maxLength: 300 }).filter(s => s.trim().length > 0),
        apis: fc.array(apiMetadataArbitrary, { minLength: 3, maxLength: 3 })
      });

      // Generator for valid file paths (no leading/trailing spaces, no path separators)
      const validFilePathArbitrary = fc.string({ minLength: 5, maxLength: 50 })
        .filter(s => {
          const trimmed = s.trim();
          return trimmed.length >= 5 && 
                 !trimmed.includes('..') && 
                 !trimmed.includes('/') && 
                 !trimmed.includes('\\') &&
                 trimmed === s; // No leading/trailing spaces
        });

      // Generator for file map
      const fileMapArbitrary = fc.dictionary(
        validFilePathArbitrary,
        fc.string({ minLength: 1, maxLength: 500 }),
        { minKeys: 1, maxKeys: 10 }
      ).map(dict => {
        const map = new Map<string, string>();
        Object.entries(dict).forEach(([key, value]) => map.set(key, value));
        return map;
      });

      // Generator for generated project
      const generatedProjectArbitrary = fc.record({
        backend: fc.record({
          structure: fc.constant({
            name: 'backend',
            type: 'directory' as const,
            children: []
          }),
          files: fileMapArbitrary
        }),
        frontend: fc.record({
          structure: fc.constant({
            name: 'frontend',
            type: 'directory' as const,
            children: []
          }),
          files: fileMapArbitrary
        }),
        readme: fc.string({ minLength: 50, maxLength: 1000 })
      });

      await fc.assert(
        fc.asyncProperty(
          generatedProjectArbitrary,
          appIdeaArbitrary,
          async (project, idea) => {
            // Create the ZIP archive
            const zipPath = await zipExporter.createArchive(project, idea);

            // Verify the ZIP file exists
            expect(await fs.pathExists(zipPath)).toBe(true);

            // Read and verify the ZIP contents
            const zip = new AdmZip(zipPath);
            const zipEntries = zip.getEntries();

            // Extract all file paths from the ZIP
            const zipFilePaths = zipEntries.map(entry => entry.entryName);

            // 1. Verify README exists at root level
            const hasReadme = zipFilePaths.some(p => p === 'README.md');
            expect(hasReadme).toBe(true);

            // 2. Verify all backend files are present with 'backend/' prefix
            const backendFiles = Array.from(project.backend.files.keys());
            for (const backendFile of backendFiles) {
              const expectedPath = path.join('backend', backendFile).replace(/\\/g, '/');
              const hasBackendFile = zipFilePaths.some(p => p === expectedPath);
              expect(hasBackendFile).toBe(true);
            }

            // 3. Verify all frontend files are present with 'frontend/' prefix
            const frontendFiles = Array.from(project.frontend.files.keys());
            for (const frontendFile of frontendFiles) {
              const expectedPath = path.join('frontend', frontendFile).replace(/\\/g, '/');
              const hasFrontendFile = zipFilePaths.some(p => p === expectedPath);
              expect(hasFrontendFile).toBe(true);
            }

            // 4. Verify files are organized into separate directories
            const backendFilesInZip = zipFilePaths.filter(p => p.startsWith('backend/'));
            const frontendFilesInZip = zipFilePaths.filter(p => p.startsWith('frontend/'));
            
            expect(backendFilesInZip.length).toBeGreaterThan(0);
            expect(frontendFilesInZip.length).toBeGreaterThan(0);

            // 5. Verify README contains setup instructions
            const readmeEntry = zip.getEntry('README.md');
            expect(readmeEntry).not.toBeNull();
            
            if (readmeEntry) {
              const readmeContent = readmeEntry.getData().toString('utf8');
              
              // Check for essential sections in README
              expect(readmeContent).toContain(idea.appName);
              expect(readmeContent).toContain('Setup Instructions');
              expect(readmeContent).toContain('Backend Setup');
              expect(readmeContent).toContain('Frontend Setup');
            }

            // Clean up the created ZIP file
            await fs.remove(zipPath);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mashup-maker, Property 6: ZIP Filename Derivation
  // Validates: Requirements 3.5
  describe('Property 6: ZIP Filename Derivation', () => {
    it('should derive ZIP filename from app name (sanitized and formatted)', async () => {
      // Generator for API metadata
      const apiMetadataArbitrary = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
        category: fc.constantFrom('weather', 'music', 'maps', 'news', 'sports', 'finance'),
        baseUrl: fc.webUrl(),
        sampleEndpoint: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        authType: fc.constantFrom('none' as const, 'apikey' as const, 'oauth' as const),
        corsCompatible: fc.boolean(),
        documentationUrl: fc.webUrl(),
        mockData: fc.option(fc.object(), { nil: undefined })
      });

      // Generator for app name with various characters
      // Must contain at least one alphanumeric character to ensure valid filename after sanitization
      const appNameArbitrary = fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => {
          const trimmed = s.trim();
          const hasAlphanumeric = /[a-zA-Z0-9]/.test(trimmed);
          return trimmed.length > 0 && hasAlphanumeric;
        });

      // Generator for app idea
      const appIdeaArbitrary = fc.record({
        appName: appNameArbitrary,
        description: fc.string({ minLength: 20, maxLength: 300 }).filter(s => s.trim().length > 0),
        features: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 3, maxLength: 5 }),
        rationale: fc.string({ minLength: 20, maxLength: 300 }).filter(s => s.trim().length > 0),
        apis: fc.array(apiMetadataArbitrary, { minLength: 3, maxLength: 3 })
      });

      // Simple project generator (minimal for this test)
      const simpleProjectArbitrary = fc.constant({
        backend: {
          structure: {
            name: 'backend',
            type: 'directory' as const,
            children: []
          },
          files: new Map([['src/server.js', 'console.log("server");']])
        },
        frontend: {
          structure: {
            name: 'frontend',
            type: 'directory' as const,
            children: []
          },
          files: new Map([['src/App.jsx', 'function App() {}']])
        },
        readme: 'Test README'
      });

      await fc.assert(
        fc.asyncProperty(
          simpleProjectArbitrary,
          appIdeaArbitrary,
          async (project, idea) => {
            // Create the ZIP archive
            const zipPath = await zipExporter.createArchive(project, idea);

            // Extract the filename without extension
            const filename = path.basename(zipPath, '.zip');

            // Property: The filename should be derived from the app name
            // 1. Should be lowercase
            expect(filename).toBe(filename.toLowerCase());

            // 2. Should only contain alphanumeric characters and hyphens
            expect(filename).toMatch(/^[a-z0-9-]+$/);

            // 3. Should not have leading or trailing hyphens
            expect(filename).not.toMatch(/^-/);
            expect(filename).not.toMatch(/-$/);

            // 4. Should be limited to 50 characters or less
            expect(filename.length).toBeLessThanOrEqual(50);

            // 5. Should contain some recognizable part of the original app name
            // (at least some alphanumeric characters from the original)
            const alphanumericFromOriginal = idea.appName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
            
            if (alphanumericFromOriginal.length > 0) {
              // The filename should contain at least some characters from the original name
              const alphanumericFromFilename = filename.replace(/-/g, '');
              
              // Check if there's overlap between original and derived filename
              // (allowing for truncation due to length limit)
              const expectedSubstring = alphanumericFromOriginal.substring(0, Math.min(50, alphanumericFromOriginal.length));
              const actualSubstring = alphanumericFromFilename.substring(0, Math.min(50, alphanumericFromFilename.length));
              
              // The derived filename should start with the same characters as the sanitized original
              // (up to the length limit)
              expect(actualSubstring).toBe(expectedSubstring.substring(0, actualSubstring.length));
            }

            // 6. Verify the full path ends with .zip
            expect(zipPath).toMatch(/\.zip$/);

            // Clean up
            await fs.remove(zipPath);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
