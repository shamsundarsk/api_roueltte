import Handlebars from 'handlebars';
import {
  APIMetadata,
  AppIdea,
  GeneratedProject,
  BackendCode,
  FrontendCode,
  FileStructure,
} from '../types';
import { CodeGenerationError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * CodeGenerator class responsible for generating backend and frontend code scaffolding
 */
export class CodeGenerator {
  /**
   * Generate a complete project with backend and frontend code
   */
  generateProject(idea: AppIdea): GeneratedProject {
    try {
      logger.logInfo('Starting code generation', { appName: idea.appName });

      const backend = this.generateBackend(idea.apis);
      const frontend = this.generateFrontend(idea);
      const readme = this.generateReadme(idea);

      logger.logInfo('Code generation completed successfully', {
        appName: idea.appName,
        backendFiles: backend.files.size,
        frontendFiles: frontend.files.size,
      });

      return {
        backend,
        frontend,
        readme,
      };
    } catch (error) {
      logger.logError(
        new CodeGenerationError('Failed to generate project code', {
          appName: idea.appName,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      throw new CodeGenerationError('Failed to generate project code', {
        appName: idea.appName,
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Generate backend code structure and files
   */
  generateBackend(apis: APIMetadata[]): BackendCode {
    const files = new Map<string, string>();

    // Generate server.js
    files.set('src/server.js', this.generateServerFile(apis));

    // Generate routes
    files.set('src/routes/mashup.routes.js', this.generateRoutesFile(apis));

    // Generate API service files for each API with unique filenames
    const usedFileNames = new Set<string>();
    apis.forEach((api, index) => {
      let serviceName = this.sanitizeFileName(api.name);
      
      // Handle filename collisions by appending index
      if (usedFileNames.has(serviceName)) {
        serviceName = `${serviceName}-${index}`;
      }
      usedFileNames.add(serviceName);
      
      files.set(
        `src/services/${serviceName}.service.js`,
        this.generateAPIStubs(api)
      );
    });

    // Generate utils
    files.set('src/utils/apiClient.js', this.generateApiClientFile());

    // Generate package.json
    files.set('package.json', this.generateBackendPackageJson(apis));

    // Generate .env.example
    files.set('.env.example', this.generateBackendEnvExample(apis));

    // Generate .gitignore
    files.set('.gitignore', this.generateBackendGitignore());

    // Generate backend README
    files.set('README.md', this.generateBackendReadme(apis));

    const structure = this.buildBackendStructure(apis);

    return {
      structure,
      files,
    };
  }

  /**
   * Generate frontend code structure and files
   */
  generateFrontend(idea: AppIdea): FrontendCode {
    const files = new Map<string, string>();

    // Generate App.jsx
    files.set('src/App.jsx', this.generateAppFile(idea));

    // Generate components for each API with unique names
    const usedComponentNames = new Set<string>();
    idea.apis.forEach((api, index) => {
      let componentName = this.toComponentName(api.name);
      
      // Handle component name collisions
      if (usedComponentNames.has(componentName)) {
        componentName = `${componentName}${index}`;
      }
      usedComponentNames.add(componentName);
      
      files.set(
        `src/components/${componentName}.jsx`,
        this.generateComponentFile(api, componentName)
      );
    });

    // Generate Dashboard component
    files.set('src/components/Dashboard.jsx', this.generateDashboardFile(idea));

    // Generate API service
    files.set('src/services/api.service.js', this.generateFrontendApiService(idea.apis));

    // Generate index.js
    files.set('src/index.js', this.generateIndexFile());

    // Generate package.json
    files.set('package.json', this.generateFrontendPackageJson(idea));

    // Generate .env.example
    files.set('.env.example', this.generateFrontendEnvExample());

    // Generate index.html
    files.set('public/index.html', this.generateIndexHtml(idea));

    // Generate App.css
    files.set('src/App.css', this.generateAppCss());

    // Generate index.css
    files.set('src/index.css', this.generateIndexCss());

    // Generate .gitignore
    files.set('.gitignore', this.generateFrontendGitignore());

    // Generate README
    files.set('README.md', this.generateFrontendReadme(idea));

    const structure = this.buildFrontendStructure(idea.apis);

    return {
      structure,
      files,
    };
  }

  /**
   * Generate API service stubs for a specific API
   */
  generateAPIStubs(api: APIMetadata): string {
    const serviceName = this.toServiceName(api.name);
    const useMockMode = api.authType === 'oauth' || api.authType === 'apikey';

    const template = `const apiClient = require('../utils/apiClient');

/**
 * Service for {{apiName}} API
 * Category: {{category}}
 * Documentation: {{documentationUrl}}
 * 
 * {{#if useMockMode}}
 * NOTE: This API requires authentication ({{authType}}).
 * Mock Mode is enabled by default. See integration instructions below.
 * {{/if}}
 */

{{#if useMockMode}}
// Mock data for {{apiName}}
const MOCK_DATA = {{{mockData}}};

/**
 * INTEGRATION INSTRUCTIONS:
 * 1. Sign up for an API key at: {{documentationUrl}}
 * 2. Add your API key to .env file: {{envVarName}}=your_api_key_here
 * 3. Update the functions below to use real API calls instead of mock data
 * 4. Remove or comment out the MOCK_DATA constant
 */
{{/if}}

/**
 * Fetch data from {{apiName}}
 * Endpoint: {{baseUrl}}{{sampleEndpoint}}
 * API Integration Point: {{apiName}}
 */
async function fetchData(params = {}) {
  {{#if useMockMode}}
  // TODO: Replace with real API call when authentication is configured
  // Uncomment the following lines and remove the mock return:
  // const response = await apiClient.get('{{baseUrl}}{{sampleEndpoint}}', {
  //   params,
  //   headers: {
  //     'Authorization': 'Bearer ' + process.env.{{envVarName}}
  //   }
  // });
  // return response.data;
  
  return MOCK_DATA;
  {{else}}
  const response = await apiClient.get('{{baseUrl}}{{sampleEndpoint}}', { params });
  return response.data;
  {{/if}}
}

module.exports = {
  fetchData,
  {{serviceName}}: {
    fetchData,
  },
};
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      apiName: api.name,
      category: api.category,
      documentationUrl: api.documentationUrl,
      useMockMode,
      authType: api.authType,
      mockData: JSON.stringify(api.mockData || { message: 'Sample data' }, null, 2),
      baseUrl: api.baseUrl,
      sampleEndpoint: api.sampleEndpoint,
      serviceName,
      envVarName: this.toEnvVarName(api.name),
    });
  }

  /**
   * Generate server.js file
   */
  private generateServerFile(apis: APIMetadata[]): string {
    const template = `const express = require('express');
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

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log('Integrated APIs:');
  {{#each apis}}
  console.log('  - {{name}} ({{category}})');
  {{/each}}
});

module.exports = app;
`;

    const compiled = Handlebars.compile(template);
    return compiled({ apis });
  }

  /**
   * Generate routes file
   */
  private generateRoutesFile(apis: APIMetadata[]): string {
    const template = `const express = require('express');
const router = express.Router();

// Import API services
{{#each apis}}
const {{serviceName}} = require('../services/{{fileName}}.service');
{{/each}}

/**
 * GET /api/mashup/data
 * Fetch data from all integrated APIs
 */
router.get('/data', async (req, res) => {
  try {
    // API Integration Point: Fetch data from all APIs
    const results = await Promise.all([
      {{#each apis}}
      {{serviceName}}.fetchData(),
      {{/each}}
    ]);

    res.json({
      success: true,
      data: {
        {{#each apis}}
        {{dataKey}}: results[{{@index}}],
        {{/each}}
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data from APIs',
    });
  }
});

module.exports = router;
`;

    const compiled = Handlebars.compile(template);
    
    // Ensure unique service names and data keys
    const usedServiceNames = new Set<string>();
    const usedDataKeys = new Set<string>();
    
    return compiled({
      apis: apis.map((api, index) => {
        let serviceName = this.toServiceName(api.name);
        let dataKey = this.toDataKey(api.name);
        
        // Handle collisions by appending index
        if (usedServiceNames.has(serviceName)) {
          serviceName = `${serviceName}${index}`;
        }
        usedServiceNames.add(serviceName);
        
        if (usedDataKeys.has(dataKey)) {
          dataKey = `${dataKey}_${index}`;
        }
        usedDataKeys.add(dataKey);
        
        return {
          name: api.name,
          serviceName,
          fileName: this.sanitizeFileName(api.name),
          dataKey,
        };
      }),
    });
  }

  /**
   * Generate API client utility file
   */
  private generateApiClientFile(): string {
    return `const axios = require('axios');

/**
 * API Client utility for making HTTP requests
 */
const apiClient = {
  /**
   * Make a GET request
   */
  async get(url, config = {}) {
    try {
      const response = await axios.get(url, config);
      return response;
    } catch (error) {
      console.error(\`API request failed: \${url}\`, error.message);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  async post(url, data, config = {}) {
    try {
      const response = await axios.post(url, data, config);
      return response;
    } catch (error) {
      console.error(\`API request failed: \${url}\`, error.message);
      throw error;
    }
  },
};

module.exports = apiClient;
`;
  }

  /**
   * Generate backend package.json
   */
  private generateBackendPackageJson(_apis: APIMetadata[]): string {
    const template = `{
  "name": "mashup-backend",
  "version": "1.0.0",
  "description": "Backend for mashup application",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
`;

    return template;
  }

  /**
   * Generate backend .env.example
   */
  private generateBackendEnvExample(apis: APIMetadata[]): string {
    const template = `PORT=3000
NODE_ENV=development

# API Keys
{{#each apis}}
{{#if needsAuth}}
# {{name}} API Key
{{envVarName}}=your_api_key_here
{{/if}}
{{/each}}
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      apis: apis.map((api) => ({
        name: api.name,
        needsAuth: api.authType === 'oauth' || api.authType === 'apikey',
        envVarName: this.toEnvVarName(api.name),
      })),
    });
  }

  /**
   * Generate App.jsx file
   */
  private generateAppFile(idea: AppIdea): string {
    const template = `import React from 'react';
import Dashboard from './components/Dashboard';
{{#each apis}}
import {{componentName}} from './components/{{componentName}}';
{{/each}}
import './App.css';

/**
 * {{appName}}
 * {{description}}
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>{{appName}}</h1>
        <p>{{description}}</p>
      </header>
      
      <main>
        <Dashboard />
        
        <div className="api-components">
          {{#each apis}}
          {/* API Integration Point: {{name}} */}
          <{{componentName}} />
          {{/each}}
        </div>
      </main>
    </div>
  );
}

export default App;
`;

    const compiled = Handlebars.compile(template);
    
    // Ensure unique component names
    const usedComponentNames = new Set<string>();
    
    return compiled({
      appName: idea.appName,
      description: idea.description,
      apis: idea.apis.map((api, index) => {
        let componentName = this.toComponentName(api.name);
        
        if (usedComponentNames.has(componentName)) {
          componentName = `${componentName}${index}`;
        }
        usedComponentNames.add(componentName);
        
        return {
          name: api.name,
          componentName,
        };
      }),
    });
  }

  /**
   * Generate component file for an API
   */
  private generateComponentFile(api: APIMetadata, componentName?: string): string {
    const finalComponentName = componentName || this.toComponentName(api.name);
    const useMockMode = api.authType === 'oauth' || api.authType === 'apikey';

    const template = `import React, { useState, useEffect } from 'react';
import { fetch{{componentName}}Data } from '../services/api.service';

/**
 * Component for {{apiName}} integration
 * Category: {{category}}
 * {{#if useMockMode}}
 * Note: Using mock data. Configure API key for real data.
 * {{/if}}
 */
function {{componentName}}() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // API Integration Point: {{apiName}}
      const result = await fetch{{componentName}}Data();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load data from {{apiName}}');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading {{apiName}} data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="{{cssClass}}">
      <h2>{{apiName}}</h2>
      <p>{{description}}</p>
      
      {/* TODO: Customize this component to display your data */}
      <div className="data-display">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      
      <button onClick={loadData}>Refresh</button>
    </div>
  );
}

export default {{componentName}};
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      componentName: finalComponentName,
      apiName: api.name,
      category: api.category,
      description: api.description,
      useMockMode,
      cssClass: this.toCssClass(api.name),
    });
  }

  /**
   * Generate Dashboard component with unified API experience
   */
  private generateDashboardFile(idea: AppIdea): string {
    const template = `import React, { useState, useEffect } from 'react';
import { ${this.generateApiServiceImports(idea.apis)} } from '../services/api.service';

/**
 * Dashboard component
 * Unified experience showcasing how {{apiCount}} APIs work together for {{appName}}
 * This demonstrates the COMBINED use case, not separate API outputs
 */
function Dashboard() {
  const [combinedData, setCombinedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('experience');

  useEffect(() => {
    loadUnifiedExperience();
  }, []);

  const loadUnifiedExperience = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data from all APIs to create unified experience
      const results = await Promise.allSettled([
        ${this.generateApiCalls(idea.apis)}
      ]);

      // Create unified experience from combined data
      const unified = {
        ${this.generateDataMapping(idea.apis)}
        insight: "{{appName}} successfully demonstrates how {{apiCount}} APIs create value together",
        timestamp: new Date().toISOString(),
        combinedValue: "This shows the power of API combinations in action"
      };

      setCombinedData(unified);
    } catch (err) {
      setError('Failed to load the unified experience');
      console.error('Unified experience error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-content">
          <h2>🔄 Loading Unified Experience...</h2>
          <p>Combining data from {{apiCount}} APIs to create {{appName}}...</p>
          <div className="api-indicators">
            {{#each apis}}
            <div className="api-indicator">
              <span className="api-icon">🔗</span>
              <span>{{name}}</span>
            </div>
            {{/each}}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-content">
          <h2>⚠️ Experience Unavailable</h2>
          <p>{error}</p>
          <button onClick={loadUnifiedExperience} className="retry-btn">
            🔄 Retry Unified Experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Experience Navigation */}
      <div className="dashboard-nav">
        <button 
          className={\`nav-tab \${activeView === 'experience' ? 'active' : ''}\`}
          onClick={() => setActiveView('experience')}
        >
          🎯 Live Experience
        </button>
        <button 
          className={\`nav-tab \${activeView === 'concept' ? 'active' : ''}\`}
          onClick={() => setActiveView('concept')}
        >
          💡 The Concept
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeView === 'experience' && (
          <div className="unified-experience">
            <div className="experience-header">
              <h2>🚀 {{appName}} in Action</h2>
              <p>See how {{apiCount}} APIs create value together</p>
            </div>

            ${this.generateUnifiedInterface(idea)}

            <div className="combined-insights">
              <h3>💡 Combined Insights</h3>
              <div className="insight-card">
                <p><strong>Result:</strong> {combinedData?.insight}</p>
                <p><strong>Value:</strong> {combinedData?.combinedValue}</p>
                <small>Generated: {combinedData?.timestamp}</small>
              </div>
            </div>
          </div>
        )}

        {activeView === 'concept' && (
          <div className="concept-view">
            <div className="concept-explanation">
              <h2>🧠 Why This Combination Works</h2>
              <p>{{rationale}}</p>
            </div>

            <div className="api-synergy">
              <h3>🔗 API Synergy Flow</h3>
              <div className="synergy-flow">
                {{#each apis}}
                <div className="synergy-step">
                  <div className="step-number">{{add @index 1}}</div>
                  <div className="step-content">
                    <h4>{{name}}</h4>
                    <p>{{category}} • {{authType}}</p>
                    <div className="step-description">
                      Provides {{category}} data that enhances the {{../appName}} experience
                    </div>
                  </div>
                  {{#unless @last}}
                  <div className="flow-arrow">→</div>
                  {{/unless}}
                </div>
                {{/each}}
              </div>
            </div>

            <div className="features-showcase">
              <h3>✨ Key Features</h3>
              <div className="features-grid">
                {{#each features}}
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-text">{{this}}</div>
                </div>
                {{/each}}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="dashboard-controls">
        <button onClick={loadUnifiedExperience} className="refresh-btn">
          🔄 Refresh Experience
        </button>
        <div className="status-indicator">
          <span className="status-dot active"></span>
          <span>{{apiCount}} APIs Connected</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
`;

    // Register Handlebars helper
    Handlebars.registerHelper('add', function(a, b) {
      return a + b;
    });

    const compiled = Handlebars.compile(template);
    return compiled({
      appName: idea.appName,
      description: idea.description,
      features: idea.features,
      rationale: idea.rationale,
      apiCount: idea.apis.length,
      apis: idea.apis.map(api => ({
        ...api,
        dataKey: this.toDataKey(api.name)
      }))
    });
  }

  /**
   * Generate API service imports for unified experience
   */
  private generateApiServiceImports(apis: APIMetadata[]): string {
    return apis.map(api => {
      const serviceName = `fetch${this.toComponentName(api.name)}Data`;
      return serviceName;
    }).join(', ');
  }

  /**
   * Generate API calls for unified experience
   */
  private generateApiCalls(apis: APIMetadata[]): string {
    return apis.map(api => {
      const serviceName = `fetch${this.toComponentName(api.name)}Data`;
      return `        ${serviceName}()`;
    }).join(',\n');
  }

  /**
   * Generate data mapping for unified experience
   */
  private generateDataMapping(apis: APIMetadata[]): string {
    return apis.map((api, index) => {
      const dataKey = this.toDataKey(api.name);
      return `        ${dataKey}: results[${index}]?.value || null`;
    }).join(',\n') + ',';
  }

  /**
   * Generate unified interface based on API combination
   */
  private generateUnifiedInterface(idea: AppIdea): string {
    const categories = idea.apis.map(api => api.category.toLowerCase());
    
    if (categories.includes('weather') && categories.includes('news')) {
      return `
            <div className="unified-interface weather-news">
              <div className="interface-header">
                <h3>🌤️ Weather-Informed News</h3>
                <p>Local conditions combined with relevant news</p>
              </div>
              
              <div className="combined-display">
                <div className="weather-context">
                  <h4>Current Weather</h4>
                  <div className="weather-info">
                    {combinedData?.weather ? (
                      <div>
                        <span className="temp">{combinedData.weather.temperature || '22°C'}</span>
                        <span className="condition">{combinedData.weather.condition || 'Sunny'}</span>
                      </div>
                    ) : (
                      <div className="mock-weather">
                        <span className="temp">22°C</span>
                        <span className="condition">Sunny</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="contextual-news">
                  <h4>Weather-Related News</h4>
                  <div className="news-items">
                    {combinedData?.news ? (
                      combinedData.news.articles?.slice(0, 2).map((article, idx) => (
                        <div key={idx} className="news-item">
                          <h5>{article.title}</h5>
                          <p>{article.summary}</p>
                        </div>
                      ))
                    ) : (
                      <div className="mock-news">
                        <div className="news-item">
                          <h5>Perfect Weather Boosts Local Events</h5>
                          <p>Sunny conditions attract visitors to outdoor activities...</p>
                        </div>
                        <div className="news-item">
                          <h5>Weather Alert: Ideal Conditions Continue</h5>
                          <p>Meteorologists predict continued pleasant weather...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="smart-insight">
                <h4>🎯 Smart Recommendation</h4>
                <p>
                  Based on current weather (sunny, 22°C) and local news trends, 
                  this is perfect weather for the outdoor events mentioned in today's news!
                </p>
              </div>
            </div>`;
    } else {
      return `
            <div className="unified-interface generic">
              <div className="interface-header">
                <h3>🎯 Unified Data Experience</h3>
                <p>{{description}}</p>
              </div>
              
              <div className="combined-display">
                <div className="data-synthesis">
                  <h4>🔗 Combined Data Flow</h4>
                  <div className="synthesis-cards">
                    {{#each apis}}
                    <div className="data-card">
                      <div className="card-header">
                        <span className="api-icon">🔌</span>
                        <h5>{{name}}</h5>
                      </div>
                      <div className="card-content">
                        <p>{{description}}</p>
                        <div className="data-status">
                          {combinedData?.{{dataKey}} ? (
                            <span className="status-success">✅ Connected</span>
                          ) : (
                            <span className="status-demo">📊 Demo Mode</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {{/each}}
                  </div>
                </div>

                <div className="unified-result">
                  <h4>✨ The Combined Result</h4>
                  <p>
                    This demonstrates how {{apiCount}} different APIs work together 
                    to create {{appName}}. Instead of separate outputs, the data 
                    flows seamlessly to create a unified, meaningful experience.
                  </p>
                </div>
              </div>
            </div>`;
    }
  }

  /**
   * Generate frontend API service
   */
  private generateFrontendApiService(apis: APIMetadata[]): string {
    const template = `import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

{{#each apis}}
/**
 * Fetch data from {{name}}
 */
export async function fetch{{componentName}}Data() {
  try {
    const response = await apiClient.get('/mashup/data');
    return response.data.data.{{dataKey}};
  } catch (error) {
    console.error('Error fetching {{name}} data:', error);
    throw error;
  }
}

{{/each}}

export default {
  {{#each apis}}
  fetch{{componentName}}Data,
  {{/each}}
};
`;

    const compiled = Handlebars.compile(template);
    
    // Ensure unique component names and data keys
    const usedComponentNames = new Set<string>();
    const usedDataKeys = new Set<string>();
    
    return compiled({
      apis: apis.map((api, index) => {
        let componentName = this.toComponentName(api.name);
        let dataKey = this.toDataKey(api.name);
        
        if (usedComponentNames.has(componentName)) {
          componentName = `${componentName}${index}`;
        }
        usedComponentNames.add(componentName);
        
        if (usedDataKeys.has(dataKey)) {
          dataKey = `${dataKey}_${index}`;
        }
        usedDataKeys.add(dataKey);
        
        return {
          name: api.name,
          componentName,
          dataKey,
        };
      }),
    });
  }

  /**
   * Generate index.js file
   */
  private generateIndexFile(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  }

  /**
   * Generate frontend package.json
   */
  private generateFrontendPackageJson(idea: AppIdea): string {
    const appNameKebab = this.toKebabCase(idea.appName);
    const template = `{
  "name": "{{appNameKebab}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "react-scripts": "^5.0.1"
  }
}
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      appNameKebab,
      description: idea.description,
    });
  }

  /**
   * Generate frontend .env.example
   */
  private generateFrontendEnvExample(): string {
    return `REACT_APP_API_BASE_URL=http://localhost:3000/api
`;
  }

  /**
   * Generate README file
   */
  private generateReadme(idea: AppIdea): string {
    const template = `# {{appName}}

{{description}}

## Features

{{#each features}}
- {{this}}
{{/each}}

## Rationale

{{rationale}}

## Integrated APIs

{{#each apis}}
### {{name}}
- **Category:** {{category}}
- **Documentation:** {{documentationUrl}}
- **Authentication:** {{authType}}
{{#if useMockMode}}
- **Status:** Using mock data (authentication required)
{{else}}
- **Status:** Ready to use
{{/if}}

{{/each}}

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
4. Add your API keys to the \`.env\` file (if required)

5. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

4. Open your browser to \`http://localhost:3000\`

## API Integration Notes

{{#each apis}}
### {{name}}

{{#if useMockMode}}
**Mock Mode Active:** This API requires authentication. The generated code includes mock data for testing.

To integrate the real API:
1. Sign up at {{documentationUrl}}
2. Get your API key
3. Add it to \`backend/.env\`: \`{{envVarName}}=your_key_here\`
4. Update the service file in \`backend/src/services/{{fileName}}.service.js\`
5. Uncomment the real API call and remove the mock data return

{{else}}
**Ready to Use:** This API doesn't require authentication. The integration code is ready to use.

{{/if}}

{{/each}}

## Next Steps

1. Customize the UI components in \`frontend/src/components/\`
2. Add error handling and loading states
3. Implement additional features based on API capabilities
4. Add styling with CSS or a UI framework
5. Test the application thoroughly
6. Deploy to your preferred hosting platform

## Project Structure

\`\`\`
/backend
  /src
    /routes       - API route handlers
    /services     - API integration services
    /utils        - Utility functions
    server.js     - Express server setup

/frontend
  /src
    /components   - React components
    /services     - Frontend API service
    App.jsx       - Main application component
\`\`\`

## Support

For API-specific questions, refer to the documentation links above.

Happy coding! 🚀
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      appName: idea.appName,
      description: idea.description,
      features: idea.features,
      rationale: idea.rationale,
      apis: idea.apis.map((api) => ({
        name: api.name,
        category: api.category,
        documentationUrl: api.documentationUrl,
        authType: api.authType,
        useMockMode: api.authType === 'oauth' || api.authType === 'apikey',
        envVarName: this.toEnvVarName(api.name),
        fileName: this.sanitizeFileName(api.name),
      })),
    });
  }

  /**
   * Build backend file structure
   */
  private buildBackendStructure(apis: APIMetadata[]): FileStructure {
    // Ensure unique service filenames
    const usedFileNames = new Set<string>();
    const serviceFiles = apis.map((api, index) => {
      let serviceName = this.sanitizeFileName(api.name);
      
      if (usedFileNames.has(serviceName)) {
        serviceName = `${serviceName}-${index}`;
      }
      usedFileNames.add(serviceName);
      
      return {
        name: `${serviceName}.service.js`,
        type: 'file' as const,
      };
    });
    
    return {
      name: 'backend',
      type: 'directory',
      children: [
        {
          name: 'src',
          type: 'directory',
          children: [
            {
              name: 'routes',
              type: 'directory',
              children: [{ name: 'mashup.routes.js', type: 'file' }],
            },
            {
              name: 'services',
              type: 'directory',
              children: serviceFiles,
            },
            {
              name: 'utils',
              type: 'directory',
              children: [{ name: 'apiClient.js', type: 'file' }],
            },
            { name: 'server.js', type: 'file' },
          ],
        },
        { name: 'package.json', type: 'file' },
        { name: '.env.example', type: 'file' },
      ],
    };
  }

  /**
   * Build frontend file structure
   */
  private buildFrontendStructure(apis: APIMetadata[]): FileStructure {
    // Ensure unique component names
    const usedComponentNames = new Set<string>();
    const componentFiles = apis.map((api, index) => {
      let componentName = this.toComponentName(api.name);
      
      if (usedComponentNames.has(componentName)) {
        componentName = `${componentName}${index}`;
      }
      usedComponentNames.add(componentName);
      
      return {
        name: `${componentName}.jsx`,
        type: 'file' as const,
      };
    });
    
    return {
      name: 'frontend',
      type: 'directory',
      children: [
        {
          name: 'src',
          type: 'directory',
          children: [
            {
              name: 'components',
              type: 'directory',
              children: [
                ...componentFiles,
                { name: 'Dashboard.jsx', type: 'file' },
              ],
            },
            {
              name: 'services',
              type: 'directory',
              children: [{ name: 'api.service.js', type: 'file' }],
            },
            { name: 'App.jsx', type: 'file' },
            { name: 'index.js', type: 'file' },
          ],
        },
        { name: 'package.json', type: 'file' },
        { name: '.env.example', type: 'file' },
      ],
    };
  }

  // Helper methods for name transformations

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private toComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/^[^a-zA-Z]/, 'Component');
  }

  private toServiceName(name: string): string {
    return this.sanitizeFileName(name).replace(/-/g, '');
  }

  private toDataKey(name: string): string {
    return this.sanitizeFileName(name).replace(/-/g, '_');
  }

  private toEnvVarName(name: string): string {
    return this.sanitizeFileName(name).toUpperCase().replace(/-/g, '_') + '_API_KEY';
  }

  private toCssClass(name: string): string {
    return this.sanitizeFileName(name);
  }

  private toKebabCase(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate index.html for React app
   */
  private generateIndexHtml(idea: AppIdea): string {
    const template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="{{description}}"
    />
    <title>{{appName}}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      appName: idea.appName,
      description: idea.description,
    });
  }

  /**
   * Generate App.css with modern styling
   */
  private generateAppCss(): string {
    return `.App {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.App-header {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.App-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 10px;
  font-weight: 700;
}

.App-header p {
  font-size: 1.2rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.dashboard-container {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
}

/* Dashboard Unified Experience Styles */
.dashboard {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}

.dashboard.loading, .dashboard.error {
  padding: 60px 40px;
  text-align: center;
}

.loading-content h2 {
  color: #667eea;
  margin-bottom: 16px;
}

.api-indicators {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.api-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  min-width: 100px;
}

.api-icon {
  font-size: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.error-content h2 {
  color: #dc2626;
  margin-bottom: 16px;
}

.retry-btn {
  margin: 20px 0;
  background: #dc2626;
}

.dashboard-nav {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.nav-tab {
  flex: 1;
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.nav-tab:hover {
  background: #f1f5f9;
  color: #475569;
  transform: none;
  box-shadow: none;
}

.nav-tab.active {
  color: #667eea;
  background: white;
  border-bottom-color: #667eea;
}

.dashboard-content {
  padding: 40px;
}

.experience-header {
  text-align: center;
  margin-bottom: 40px;
}

.experience-header h2 {
  color: #1e293b;
  font-size: 28px;
  margin-bottom: 12px;
}

.unified-interface {
  margin-bottom: 40px;
}

.interface-header {
  text-align: center;
  margin-bottom: 30px;
}

.interface-header h3 {
  color: #1e293b;
  font-size: 24px;
  margin-bottom: 12px;
}

.combined-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.weather-context, .contextual-news {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.temp {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
}

.condition {
  font-size: 18px;
  color: #64748b;
}

.news-items, .mock-news {
  margin-top: 16px;
}

.news-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
  text-align: left;
}

.news-item h5 {
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 16px;
}

.news-item p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.data-synthesis {
  margin-bottom: 40px;
}

.synthesis-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.data-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-content p {
  color: #64748b;
  margin-bottom: 12px;
  text-align: left;
}

.data-status {
  margin-top: 12px;
}

.status-success {
  color: #059669;
  font-weight: 600;
}

.status-demo {
  color: #7c3aed;
  font-weight: 600;
}

.combined-insights, .smart-insight {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.combined-insights h3, .smart-insight h4 {
  color: #14532d;
  margin-bottom: 12px;
}

.combined-insights p, .smart-insight p {
  color: #166534;
  line-height: 1.6;
}

.insight-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: left;
}

.concept-explanation {
  text-align: center;
  margin-bottom: 40px;
}

.concept-explanation h2 {
  color: #1e293b;
  font-size: 28px;
  margin-bottom: 16px;
}

.api-synergy {
  margin-bottom: 40px;
}

.synergy-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.synergy-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 200px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 12px;
}

.step-content h4 {
  color: #1e293b;
  margin-bottom: 8px;
}

.step-content p {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
}

.step-description {
  color: #475569;
  font-size: 13px;
  line-height: 1.4;
}

.flow-arrow {
  font-size: 20px;
  color: #667eea;
  margin: 0 8px;
}

.features-showcase {
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.feature-text {
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.dashboard-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.refresh-btn {
  background: #667eea;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.status-dot.active {
  animation: pulse 2s infinite;
}

.api-components {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.component-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.component-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.component-card h3 {
  color: #667eea;
  margin-bottom: 16px;
  font-size: 1.5rem;
}

.component-card p {
  color: #4a5568;
  line-height: 1.6;
}

.loading {
  color: #667eea;
  font-size: 1.2rem;
  padding: 40px;
}

.error {
  color: #e53e3e;
  background-color: #fff5f5;
  border: 1px solid #fc8181;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .App {
    padding: 10px;
  }
  
  .App-header h1 {
    font-size: 2rem;
  }
  
  .api-components {
    grid-template-columns: 1fr;
  }
  
  .dashboard-content {
    padding: 20px;
  }
  
  .dashboard-nav {
    flex-direction: column;
  }
  
  .nav-tab {
    border-bottom: 1px solid #e2e8f0;
    border-right: none;
  }
  
  .nav-tab.active {
    border-bottom-color: #e2e8f0;
    border-left: 3px solid #667eea;
  }
  
  .combined-display {
    grid-template-columns: 1fr;
  }
  
  .synergy-flow {
    flex-direction: column;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
    margin: 8px 0;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .synthesis-cards {
    grid-template-columns: 1fr;
  }
  
  .dashboard-controls {
    flex-direction: column;
    gap: 16px;
  }
}
`;
  }

  /**
   * Generate index.css with global styles
   */
  private generateIndexCss(): string {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

#root {
  min-height: 100vh;
}
`;
  }

  /**
   * Generate .gitignore for frontend
   */
  private generateFrontendGitignore(): string {
    return `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
`;
  }

  /**
   * Generate .gitignore for backend
   */
  private generateBackendGitignore(): string {
    return `# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Build
dist/
build/
`;
  }

  /**
   * Generate backend-specific README
   */
  private generateBackendReadme(apis: APIMetadata[]): string {
    const template = `# Backend API Server

This is the backend server that integrates with multiple APIs.

## Integrated APIs

{{#each apis}}
- **{{name}}** ({{category}})
  - Authentication: {{authType}}
  - Documentation: {{documentationUrl}}
{{/each}}

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create a \`.env\` file based on \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Add your API keys to the \`.env\` file (if required)

### Running the Server

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

The server will run on [http://localhost:3000](http://localhost:3000)

For production:

\`\`\`bash
npm start
\`\`\`

## API Endpoints

### GET /api/mashup/data

Fetches data from all integrated APIs.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    // Combined data from all APIs
  }
}
\`\`\`

## Project Structure

\`\`\`
src/
├── routes/         # API routes
├── services/       # API integration services
├── utils/          # Utility functions
└── server.js       # Express server setup
\`\`\`

## Environment Variables

See \`.env.example\` for required environment variables.

## Error Handling

The API includes comprehensive error handling. Check the console logs for detailed error messages during development.
`;

    const compiled = Handlebars.compile(template);
    return compiled({ apis });
  }

  /**
   * Generate frontend-specific README
   */
  private generateFrontendReadme(idea: AppIdea): string {
    const template = `# {{appName}} - Frontend

This is the frontend application for {{appName}}.

## Description

{{description}}

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create a \`.env\` file based on \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Make sure the backend server is running on http://localhost:3000

### Running the App

Start the development server:

\`\`\`bash
npm start
\`\`\`

The app will open at [http://localhost:3001](http://localhost:3001)

### Building for Production

Create an optimized production build:

\`\`\`bash
npm run build
\`\`\`

The build folder will contain the production-ready files.

## Project Structure

\`\`\`
src/
├── components/     # React components
├── services/       # API service layer
├── App.jsx         # Main App component
├── App.css         # App styles
├── index.js        # Entry point
└── index.css       # Global styles
\`\`\`

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm test\` - Runs the test suite
- \`npm run eject\` - Ejects from Create React App (one-way operation)

## Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://create-react-app.dev/)

## API Integration

This frontend communicates with the backend API at the URL specified in your \`.env\` file.

Make sure the backend server is running before starting the frontend.
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      appName: idea.appName,
      description: idea.description,
    });
  }
}
