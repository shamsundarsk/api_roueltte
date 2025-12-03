import { CodePreviewGenerator } from '../generator/CodePreviewGenerator';
import {
  GeneratedProject,
  FileStructure,
} from '../types';

describe('CodePreviewGenerator', () => {
  let generator: CodePreviewGenerator;

  beforeEach(() => {
    generator = new CodePreviewGenerator();
  });

  // Helper function to create a mock generated project
  const createMockProject = (): GeneratedProject => {
    const backendFiles = new Map<string, string>();
    backendFiles.set(
      'src/server.js',
      `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mashupRoutes = require('./routes/mashup.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/mashup', mashupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mashup Maker API is running' });
});

// API Integration Point: Weather API
// API Integration Point: Music API
// API Integration Point: Maps API

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log('Integrated APIs:');
  console.log('  - Weather API (weather)');
  console.log('  - Music API (music)');
  console.log('  - Maps API (maps)');
});

module.exports = app;
`
    );

    const frontendFiles = new Map<string, string>();
    frontendFiles.set(
      'src/App.jsx',
      `import React from 'react';
import Dashboard from './components/Dashboard';
import WeatherComponent from './components/WeatherComponent';
import MusicComponent from './components/MusicComponent';
import MapsComponent from './components/MapsComponent';
import './App.css';

/**
 * Weather Music Maps App
 * An app that combines weather, music, and maps
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Music Maps App</h1>
        <p>An app that combines weather, music, and maps</p>
      </header>
      
      <main>
        <Dashboard />
        
        <div className="api-components">
          {/* API Integration Point: Weather API */}
          <WeatherComponent />
          {/* API Integration Point: Music API */}
          <MusicComponent />
          {/* API Integration Point: Maps API */}
          <MapsComponent />
        </div>
      </main>
    </div>
  );
}

export default App;
`
    );

    const backendStructure: FileStructure = {
      name: 'backend',
      type: 'directory',
      children: [
        {
          name: 'src',
          type: 'directory',
          children: [
            { name: 'server.js', type: 'file' },
            {
              name: 'routes',
              type: 'directory',
              children: [{ name: 'mashup.routes.js', type: 'file' }],
            },
          ],
        },
        { name: 'package.json', type: 'file' },
      ],
    };

    const frontendStructure: FileStructure = {
      name: 'frontend',
      type: 'directory',
      children: [
        {
          name: 'src',
          type: 'directory',
          children: [
            { name: 'App.jsx', type: 'file' },
            {
              name: 'components',
              type: 'directory',
              children: [
                { name: 'Dashboard.jsx', type: 'file' },
                { name: 'WeatherComponent.jsx', type: 'file' },
              ],
            },
          ],
        },
        { name: 'package.json', type: 'file' },
      ],
    };

    return {
      backend: {
        structure: backendStructure,
        files: backendFiles,
      },
      frontend: {
        structure: frontendStructure,
        files: frontendFiles,
      },
      readme: '# Test Project\n\nThis is a test project.',
    };
  };

  describe('generatePreview', () => {
    it('should generate a complete code preview with all required components', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      // Validates: Requirement 9.1 - folder structure
      expect(preview.structure).toBeDefined();
      expect(preview.structure.name).toBe('project');
      expect(preview.structure.type).toBe('directory');
      expect(preview.structure.children).toBeDefined();
      expect(preview.structure.children!.length).toBeGreaterThanOrEqual(2);

      // Validates: Requirement 9.2 - backend and frontend snippets
      expect(preview.backendSnippet).toBeDefined();
      expect(preview.backendSnippet.length).toBeGreaterThan(0);
      expect(preview.frontendSnippet).toBeDefined();
      expect(preview.frontendSnippet.length).toBeGreaterThan(0);
    });

    it('should extract backend entry point snippet', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      // Should contain content from server.js
      expect(preview.backendSnippet).toContain('express');
      expect(preview.backendSnippet).toContain('const app = express()');
    });

    it('should extract frontend entry point snippet', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      // Should contain content from App.jsx
      expect(preview.frontendSnippet).toContain('React');
      expect(preview.frontendSnippet).toContain('function App()');
    });

    it('should mark API integration points in backend snippet', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      // Validates: Requirement 9.3 - marked integration points
      expect(preview.backendSnippet).toContain('>>> // API Integration Point:');
      expect(preview.backendSnippet).toContain('Weather API <<<');
    });

    it('should mark API integration points in frontend snippet', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      // Validates: Requirement 9.3 - marked integration points
      expect(preview.frontendSnippet).toContain('{>>> /* API Integration Point:');
      expect(preview.frontendSnippet).toContain('Weather API */ <<<}');
    });

    it('should include README in combined structure', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      const readmeFile = preview.structure.children?.find(
        (child) => child.name === 'README.md'
      );
      expect(readmeFile).toBeDefined();
      expect(readmeFile?.type).toBe('file');
    });

    it('should include both backend and frontend structures', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      const backendDir = preview.structure.children?.find(
        (child) => child.name === 'backend'
      );
      const frontendDir = preview.structure.children?.find(
        (child) => child.name === 'frontend'
      );

      expect(backendDir).toBeDefined();
      expect(backendDir?.type).toBe('directory');
      expect(frontendDir).toBeDefined();
      expect(frontendDir?.type).toBe('directory');
    });

    it('should limit snippet length and add ellipsis for long files', () => {
      const project = createMockProject();
      
      // Add a very long file
      const longCode = Array(100)
        .fill('console.log("line");')
        .join('\n');
      project.backend.files.set('src/server.js', longCode);

      const preview = generator.generatePreview(project);

      // Should be truncated
      const lines = preview.backendSnippet.split('\n');
      expect(lines.length).toBeLessThanOrEqual(41); // 40 lines + ellipsis
      expect(preview.backendSnippet).toContain('// ... (more code below)');
    });

    it('should handle missing backend entry point gracefully', () => {
      const project = createMockProject();
      project.backend.files.delete('src/server.js');

      const preview = generator.generatePreview(project);

      expect(preview.backendSnippet).toBe('// Backend entry point not found');
    });

    it('should handle missing frontend entry point gracefully', () => {
      const project = createMockProject();
      project.frontend.files.delete('src/App.jsx');

      const preview = generator.generatePreview(project);

      expect(preview.frontendSnippet).toBe('// Frontend entry point not found');
    });

    it('should preserve code structure in snippets', () => {
      const project = createMockProject();
      const preview = generator.generatePreview(project);

      // Should maintain indentation and structure
      expect(preview.backendSnippet).toContain('const express');
      expect(preview.backendSnippet).toContain('app.use(');
      expect(preview.frontendSnippet).toContain('function App()');
      expect(preview.frontendSnippet).toContain('return (');
    });
  });

  describe('edge cases', () => {
    it('should handle empty backend files', () => {
      const project = createMockProject();
      project.backend.files.set('src/server.js', '');

      const preview = generator.generatePreview(project);

      // Empty string is valid content, should return empty
      expect(preview.backendSnippet).toBe('');
    });

    it('should handle empty frontend files', () => {
      const project = createMockProject();
      project.frontend.files.set('src/App.jsx', '');

      const preview = generator.generatePreview(project);

      // Empty string is valid content, should return empty
      expect(preview.frontendSnippet).toBe('');
    });

    it('should handle files with only whitespace', () => {
      const project = createMockProject();
      project.backend.files.set('src/server.js', '   \n\n   \n');

      const preview = generator.generatePreview(project);

      expect(preview.backendSnippet).toBeDefined();
    });

    it('should handle multiple API integration point markers', () => {
      const project = createMockProject();
      const codeWithMultipleMarkers = `
// API Integration Point: API 1
const api1 = require('./api1');
// API Integration Point: API 2
const api2 = require('./api2');
// API Integration Point: API 3
const api3 = require('./api3');
`;
      project.backend.files.set('src/server.js', codeWithMultipleMarkers);

      const preview = generator.generatePreview(project);

      // All markers should be highlighted
      const markerCount = (preview.backendSnippet.match(/>>>/g) || []).length;
      expect(markerCount).toBe(3);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: mashup-maker, Property 16: Complete Code Preview
     * Validates: Requirements 9.1, 9.2, 9.3
     * 
     * For any generated mashup, the code preview should include the folder structure, 
     * backend entry point snippet, frontend entry point snippet, and marked API integration points.
     */
    it('should always generate complete code preview with all required components', () => {
      const fc = require('fast-check');

      // Generator for file structure
      const arbitraryFileStructure = (name: string, maxDepth: number = 2): any => {
        if (maxDepth === 0) {
          return fc.constant({
            name,
            type: 'file' as const,
          });
        }

        return fc.oneof(
          fc.constant({
            name,
            type: 'file' as const,
          }),
          fc.array(
            fc.tuple(
              fc.string({ minLength: 1, maxLength: 20 }),
              fc.integer({ min: 0, max: maxDepth - 1 })
            ).chain(([childName, depth]: [string, number]) => arbitraryFileStructure(childName, depth)),
            { minLength: 0, maxLength: 5 }
          ).map((children: any) => ({
            name,
            type: 'directory' as const,
            children,
          }))
        );
      };

      // Generator for code content with API integration points
      const arbitraryCodeWithIntegrationPoints = fc.tuple(
        fc.integer({ min: 0, max: 5 }), // number of integration points
        fc.integer({ min: 10, max: 100 }) // number of lines
      ).chain(([numIntegrationPoints, numLines]: [number, number]) => {
        const lines: string[] = [];
        const integrationPointLines = new Set<number>();

        // Randomly place integration points
        for (let i = 0; i < numIntegrationPoints; i++) {
          const lineNum = Math.floor(Math.random() * numLines);
          integrationPointLines.add(lineNum);
        }

        // Generate code lines
        for (let i = 0; i < numLines; i++) {
          if (integrationPointLines.has(i)) {
            lines.push(`// API Integration Point: API ${i}`);
          } else {
            lines.push(`const line${i} = 'code';`);
          }
        }

        return fc.constant(lines.join('\n'));
      });

      // Generator for GeneratedProject
      const arbitraryGeneratedProject = fc.record({
        backend: fc.record({
          structure: arbitraryFileStructure('backend', 2),
          files: fc.constant(new Map<string, string>()).chain((baseMap: Map<string, string>) => {
            return arbitraryCodeWithIntegrationPoints.map((code: string) => {
              const map = new Map(baseMap);
              map.set('src/server.js', code);
              return map;
            });
          }),
        }),
        frontend: fc.record({
          structure: arbitraryFileStructure('frontend', 2),
          files: fc.constant(new Map<string, string>()).chain((baseMap: Map<string, string>) => {
            return arbitraryCodeWithIntegrationPoints.map((code: string) => {
              const map = new Map(baseMap);
              map.set('src/App.jsx', code);
              return map;
            });
          }),
        }),
        readme: fc.string({ minLength: 10, maxLength: 500 }),
      });

      // Property test
      fc.assert(
        fc.property(arbitraryGeneratedProject, (project: GeneratedProject) => {
          const preview = generator.generatePreview(project);

          // Validates: Requirement 9.1 - folder structure must be present
          expect(preview.structure).toBeDefined();
          expect(preview.structure.name).toBe('project');
          expect(preview.structure.type).toBe('directory');
          expect(preview.structure.children).toBeDefined();
          expect(Array.isArray(preview.structure.children)).toBe(true);
          expect(preview.structure.children!.length).toBeGreaterThanOrEqual(2);

          // Verify backend and frontend are in structure
          const childNames = preview.structure.children!.map(child => child.name);
          expect(childNames).toContain('backend');
          expect(childNames).toContain('frontend');
          expect(childNames).toContain('README.md');

          // Validates: Requirement 9.2 - backend and frontend snippets must be present
          expect(preview.backendSnippet).toBeDefined();
          expect(typeof preview.backendSnippet).toBe('string');
          expect(preview.frontendSnippet).toBeDefined();
          expect(typeof preview.frontendSnippet).toBe('string');

          // Validates: Requirement 9.3 - API integration points must be marked
          // If the snippet contains integration points, they should be marked
          // Note: The snippet is truncated to 40 lines, so we only check for markers
          // if integration points appear within the snippet itself
          const backendSnippetHasIntegrationPoints = preview.backendSnippet.includes('API Integration Point:');
          const frontendSnippetHasIntegrationPoints = preview.frontendSnippet.includes('API Integration Point:');

          if (backendSnippetHasIntegrationPoints) {
            // Markers should be present (>>> and <<<)
            expect(preview.backendSnippet).toContain('>>>');
            expect(preview.backendSnippet).toContain('<<<');
          }

          if (frontendSnippetHasIntegrationPoints) {
            // Markers should be present (>>> and <<<)
            expect(preview.frontendSnippet).toContain('>>>');
            expect(preview.frontendSnippet).toContain('<<<');
          }

          // Verify structure is well-formed
          const validateStructure = (struct: FileStructure): boolean => {
            if (!struct.name || !struct.type) return false;
            if (struct.type !== 'file' && struct.type !== 'directory') return false;
            if (struct.type === 'directory' && struct.children) {
              return struct.children.every(child => validateStructure(child));
            }
            return true;
          };

          expect(validateStructure(preview.structure)).toBe(true);
        }),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });
  });
});
