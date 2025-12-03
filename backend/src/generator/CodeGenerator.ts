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
   * Generate Dashboard component
   */
  private generateDashboardFile(idea: AppIdea): string {
    const template = `import React from 'react';

/**
 * Dashboard component
 * Main hub for {{appName}}
 */
function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="features">
        <h3>Key Features</h3>
        <ul>
          {{#each features}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      
      <div className="rationale">
        <h3>About This App</h3>
        <p>{{rationale}}</p>
      </div>
    </div>
  );
}

export default Dashboard;
`;

    const compiled = Handlebars.compile(template);
    return compiled({
      appName: idea.appName,
      features: idea.features,
      rationale: idea.rationale,
    });
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
}
