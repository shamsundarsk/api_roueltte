# Mashup Maker
A developer tool that generates unique application concepts by randomly combining three APIs from a curated registry. The system produces complete app ideas with code scaffolding, UI layout suggestions, and downloadable starter projects.
Perfect for developers, students, and hackathon participants who need rapid ideation and project initialization capabilities.

## Features
- 🎲 **Random API Combination**: Automatically selects 3 unique APIs from different categories
- 💡 **Creative App Ideas**: Generates complete app concepts with names, descriptions, and feature lists
- 📦 **Code Scaffolding**: Creates ready-to-use backend (Node.js/Express) and frontend (React) boilerplate
- 🎨 **UI Layout Suggestions**: Provides wireframe descriptions and component recommendations
- ⬇️ **Downloadable Projects**: Bundles everything into a ZIP file with setup instructions
- 🔄 **Regeneration**: Don't like the result? Generate a new combination instantly
- 🎭 **Mock Mode**: Gracefully handles APIs requiring authentication with sample data
- 🤖 **AI Project Assistant**: Built-in chatbot to help with code understanding, debugging, and API integration

## Quick Start
### Prerequisites
- Node.js 18+ and npm
- Git

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd mashup-maker
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

3. In a new terminal, set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

4. Open your browser to `http://localhost:5173`

The backend server will run on `http://localhost:3000`

## AI Project Assistant 🤖

Mashup Maker includes an intelligent AI chatbot that helps you understand and work with your downloaded projects.

### Features

The AI assistant can help you with:

- **Code Explanation**: Understand the generated code structure and how components work together
- **Error Debugging**: Get precise solutions for errors with specific file and line references
- **API Integration**: Step-by-step guidance for adding API keys and implementing authentication
- **Best Practices**: Suggestions for improvements and industry-standard patterns
- **Project Setup**: Help with environment configuration and dependency management

### Setup

To enable the AI chatbot, add your API key to `backend/.env`:

```env
# AI Chatbot Configuration
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4
AI_API_URL=https://api.openai.com/v1/chat/completions
```

Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

### Usage

1. Generate and download a project
2. Click the floating 🤖 button in the bottom-right corner
3. Ask questions about your project:
   - "How do I add my API keys?"
   - "Explain how the backend routes work"
   - "I'm getting a CORS error, how do I fix it?"
   - "What's the best way to deploy this project?"

The chatbot understands your specific project context, including which APIs you're using and the generated code structure.

### Quick Help

For instant answers without AI processing, use the quick help buttons:
- 📦 **Setup Guide** - Complete installation instructions
- 🔑 **API Keys** - How to add and configure API keys
- 🐛 **Common Errors** - Solutions for frequent issues
- 📁 **Project Structure** - Overview of files and folders

## Project Structure

This is a monorepo containing both backend and frontend applications:

```
mashup-maker/
├── backend/                    # Node.js/Express backend with TypeScript
│   ├── src/
│   │   ├── __tests__/         # Test files
│   │   ├── errors/            # Custom error classes
│   │   ├── exporter/          # ZIP export functionality
│   │   ├── generator/         # Code, idea, and UI generation
│   │   ├── middleware/        # Express middleware
│   │   ├── pipeline/          # Mashup generation orchestration
│   │   ├── registry/          # API registry management
│   │   ├── routes/            # API endpoints
│   │   ├── selector/          # API selection logic
│   │   ├── services/          # Business logic services
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── validation/        # Request validation schemas
│   │   └── server.ts          # Express server entry point
│   ├── data/
│   │   └── api-registry.json  # Curated API metadata
│   ├── temp/                  # Temporary ZIP file storage
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React frontend with Vite and TypeScript
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React Context for state management
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── .kiro/specs/               # Feature specifications
└── README.md
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### 1. Generate Mashup

Generate a new mashup with three random APIs.

**Endpoint:** `POST /api/mashup/generate`

**Request Body:**
```json
{
  "options": {
    "excludeCategories": ["weather"],  // Optional: categories to exclude
    "corsOnly": true                   // Optional: only select CORS-compatible APIs
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "mashup_abc123",
    "idea": {
      "appName": "Weather Music Navigator",
      "description": "An app that plays music based on current weather conditions...",
      "features": [
        "Real-time weather data integration",
        "Music playlist generation based on weather mood",
        "Interactive map showing weather patterns"
      ],
      "rationale": "These APIs work together because weather influences mood, music enhances mood, and maps provide context...",
      "apis": [
        {
          "id": "openweather",
          "name": "OpenWeather API",
          "description": "Weather data and forecasts",
          "category": "weather",
          "baseUrl": "https://api.openweathermap.org",
          "sampleEndpoint": "/data/2.5/weather",
          "authType": "apikey",
          "corsCompatible": true,
          "documentationUrl": "https://openweathermap.org/api"
        }
        // ... two more APIs
      ]
    },
    "uiLayout": {
      "screens": [
        {
          "name": "Dashboard",
          "description": "Main screen showing weather and music recommendations",
          "components": ["WeatherCard", "MusicPlayer", "MapView"]
        }
      ],
      "components": [
        {
          "type": "card",
          "purpose": "Display current weather data",
          "apiSource": "OpenWeather API"
        }
      ],
      "interactionFlow": {
        "steps": [
          {
            "from": "Dashboard",
            "to": "MusicPlayer",
            "action": "User clicks on recommended playlist"
          }
        ]
      }
    },
    "codePreview": {
      "backendSnippet": "// Backend entry point code...",
      "frontendSnippet": "// Frontend entry point code...",
      "structure": {
        "name": "root",
        "type": "directory",
        "children": [...]
      }
    },
    "downloadUrl": "/api/mashup/download/weather-music-navigator.zip",
    "timestamp": 1701360000000
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_APIS",
    "message": "Not enough APIs available for selection"
  }
}
```

#### 2. Download Mashup

Download the ZIP archive for a generated mashup.

**Endpoint:** `GET /api/mashup/download/:filename`

**Parameters:**
- `filename` (path parameter): The ZIP filename from the mashup generation response

**Example:**
```
GET /api/mashup/download/weather-music-navigator.zip
```

**Success Response (200 OK):**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="weather-music-navigator.zip"`
- Binary ZIP file data

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found: weather-music-navigator.zip"
  }
}
```

#### 3. Get All APIs

Retrieve all APIs from the registry with optional filtering.

**Endpoint:** `GET /api/registry/apis`

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "weather", "music", "maps")
- `authType` (optional): Filter by authentication type ("none", "apikey", "oauth")

**Examples:**
```
GET /api/registry/apis
GET /api/registry/apis?category=weather
GET /api/registry/apis?authType=none
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "apis": [
      {
        "id": "openweather",
        "name": "OpenWeather API",
        "description": "Weather data and forecasts",
        "category": "weather",
        "baseUrl": "https://api.openweathermap.org",
        "sampleEndpoint": "/data/2.5/weather",
        "authType": "apikey",
        "corsCompatible": true,
        "documentationUrl": "https://openweathermap.org/api"
      }
      // ... more APIs
    ],
    "count": 50
  }
}
```

#### 4. Add New API

Add a new API to the registry (admin functionality).

**Endpoint:** `POST /api/registry/apis`

**Request Body:**
```json
{
  "id": "new-api",
  "name": "New API",
  "description": "Description of the API functionality",
  "category": "weather",
  "baseUrl": "https://api.example.com",
  "sampleEndpoint": "/v1/data",
  "authType": "apikey",
  "corsCompatible": true,
  "documentationUrl": "https://docs.example.com"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "new-api",
    "message": "API added successfully"
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_API",
    "message": "API with id 'new-api' already exists"
  }
}
```

## Adding New APIs to the Registry

The API registry is stored in `backend/data/api-registry.json`. You can add new APIs in two ways:

### Method 1: Direct File Edit

1. Open `backend/data/api-registry.json`
2. Add a new API object to the `apis` array:

```json
{
  "id": "unique-api-id",
  "name": "API Display Name",
  "description": "Brief description of what the API does",
  "category": "category-name",
  "baseUrl": "https://api.example.com",
  "sampleEndpoint": "/v1/endpoint",
  "authType": "none",
  "corsCompatible": true,
  "documentationUrl": "https://docs.example.com"
}
```

3. Restart the backend server

### Method 2: API Endpoint

Use the `POST /api/registry/apis` endpoint (see API documentation above).

### API Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (lowercase, hyphenated) |
| `name` | string | Yes | Display name for the API |
| `description` | string | Yes | Brief description of API functionality |
| `category` | string | Yes | Category (e.g., "weather", "music", "maps", "finance") |
| `baseUrl` | string | Yes | Base URL for API requests |
| `sampleEndpoint` | string | Yes | Example endpoint path |
| `authType` | string | Yes | Authentication type: "none", "apikey", or "oauth" |
| `corsCompatible` | boolean | Yes | Whether the API supports CORS |
| `mockData` | object | No | Sample response data for Mock Mode |
| `documentationUrl` | string | Yes | Link to API documentation |

### Categories

Common categories include:
- `weather` - Weather and climate data
- `music` - Music streaming and metadata
- `maps` - Mapping and geolocation
- `finance` - Financial data and cryptocurrency
- `news` - News articles and headlines
- `social` - Social media platforms
- `food` - Recipe and restaurant data
- `sports` - Sports scores and statistics
- `entertainment` - Movies, TV shows, games
- `productivity` - Task management and calendars
- `communication` - Messaging and email
- `data` - General data and statistics

## Environment Variables

### Backend Environment Variables

The backend requires the following environment variables (see `backend/.env.example`):

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Port number for the backend server | `3000` | No |
| `NODE_ENV` | Node environment (development, production, test) | `development` | No |
| `TEMP_DIR` | Directory for temporary ZIP file storage | `backend/temp` | No |
| `MAX_ZIP_SIZE_MB` | Maximum ZIP file size in megabytes | `50` | No |
| `CLEANUP_INTERVAL_HOURS` | Interval for cleaning up old ZIP files | `24` | No |

**Environment Variable Validation:**
- The backend validates all environment variables on startup
- Invalid values will cause the server to exit with an error message
- `PORT` must be between 1 and 65535
- `NODE_ENV` must be one of: development, production, test
- `TEMP_DIR` must be a non-empty string
- `MAX_ZIP_SIZE_MB` must be a positive number
- `CLEANUP_INTERVAL_HOURS` must be a positive number

### Frontend Environment Variables

The frontend requires the following environment variables (see `frontend/.env.example`):

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Base URL for backend API requests | `http://localhost:3000/api` | Yes |

**Environment Variable Validation:**
- The frontend validates all environment variables on startup
- Invalid values will display an error in the browser console
- `VITE_API_BASE_URL` must be a valid URL format
- In development mode, validation errors are displayed in the UI

## Code Generation Templates

The system uses Handlebars templates to generate backend and frontend code. Templates are located in the code generator component.

### Customizing Templates

To customize the generated code:

1. **Backend Templates**: Modify `backend/src/generator/CodeGenerator.ts`
   - Look for template strings in the `generateBackend()` method
   - Templates use `{{PLACEHOLDER}}` syntax for variable substitution
   - Available placeholders: `{{API_NAME}}`, `{{API_ENDPOINT}}`, `{{BASE_URL}}`, etc.

2. **Frontend Templates**: Modify `backend/src/generator/CodeGenerator.ts`
   - Look for template strings in the `generateFrontend()` method
   - Component templates follow React functional component patterns
   - Service templates use Axios for HTTP requests

### Template Structure

**Backend Service Template Example:**
```javascript
// services/{{api-name}}.service.js
const axios = require('axios');

const BASE_URL = '{{BASE_URL}}';

/**
 * Service for {{API_NAME}}
 * Documentation: {{DOCUMENTATION_URL}}
 */
class {{API_NAME}}Service {
  async fetchData() {
    // TODO: Add your API key or authentication
    const response = await axios.get(`${BASE_URL}{{SAMPLE_ENDPOINT}}`);
    return response.data;
  }
}

module.exports = new {{API_NAME}}Service();
```

**Frontend Component Template Example:**
```jsx
// components/{{API_NAME}}Component.jsx
import React, { useState, useEffect } from 'react';
import { fetch{{API_NAME}}Data } from '../services/api.service';

function {{API_NAME}}Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // TODO: Implement data fetching
    fetch{{API_NAME}}Data().then(setData);
  }, []);
  
  return (
    <div className="{{api-name}}-component">
      {/* TODO: Render {{API_NAME}} data */}
    </div>
  );
}

export default {{API_NAME}}Component;
```

### Adding New Frameworks

To add support for additional frameworks (e.g., Vue.js, Python/FastAPI):

1. Create new template methods in `CodeGenerator.ts`
2. Add framework detection logic in `generateProject()`
3. Update the `GeneratedProject` interface in `types/api.types.ts`
4. Add corresponding tests in `__tests__/CodeGenerator.test.ts`

## Development

### Backend Commands

```bash
cd backend

# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev              # Start development server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Testing

The project uses **Jest** for unit testing and **fast-check** for property-based testing.

**Running Tests:**
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

**Test Structure:**
- Unit tests: `backend/src/__tests__/*.test.ts`
- Property-based tests: Tagged with `// Feature: mashup-maker, Property X: ...`
- Each property test runs 100+ iterations with randomly generated inputs

**Writing Tests:**

Unit test example:
```typescript
describe('APIRegistry', () => {
  it('should return all APIs', () => {
    const registry = new APIRegistry();
    const apis = registry.getAllAPIs();
    expect(apis.length).toBeGreaterThan(0);
  });
});
```

Property-based test example:
```typescript
import fc from 'fast-check';

// Feature: mashup-maker, Property 1: API Selection Constraints
it('should always select exactly 3 unique APIs from different categories', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 3, max: 10 }),
      (numCategories) => {
        // Test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

### Code Documentation

The codebase uses JSDoc comments for documentation:

```typescript
/**
 * Generates a complete mashup project with backend and frontend code
 * 
 * @param idea - The app idea containing API metadata and concept details
 * @returns A GeneratedProject with all files and folder structure
 * @throws {Error} If code generation fails
 * 
 * @example
 * const project = generator.generateProject(appIdea);
 * console.log(project.backend.files.size); // Number of backend files
 */
generateProject(idea: AppIdea): GeneratedProject {
  // Implementation
}
```

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Generate   │  │   Display    │  │   Download   │      │
│  │    Button    │  │   Results    │  │    Button    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Mashup Generation Pipeline              │   │
│  │                                                       │   │
│  │  API Selector → Idea Generator → Code Generator      │   │
│  │       ↓              ↓                ↓               │   │
│  │  UI Suggester ← ─ ─ ─ ┴ ─ ─ ─ → ZIP Exporter        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Registry                        │   │
│  │              (JSON file storage)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **API Registry** (`backend/src/registry/`): Manages the curated list of 50+ public APIs
2. **API Selector** (`backend/src/selector/`): Selects 3 unique APIs from different categories
3. **Idea Generator** (`backend/src/generator/IdeaGenerator.ts`): Creates app concepts from API combinations
4. **Code Generator** (`backend/src/generator/CodeGenerator.ts`): Generates backend and frontend boilerplate
5. **UI Layout Suggester** (`backend/src/generator/UILayoutSuggester.ts`): Provides UI/UX recommendations
6. **ZIP Exporter** (`backend/src/exporter/`): Bundles files into downloadable archives
7. **Mashup Pipeline** (`backend/src/pipeline/`): Orchestrates the entire generation process

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Testing:** Jest + fast-check (property-based testing)
- **Template Engine:** Handlebars
- **ZIP Library:** archiver
- **Validation:** Joi
- **File System:** fs-extra

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Styling:** CSS Modules

### Development Tools
- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check that Node.js 18+ is installed: `node --version`
- Verify environment variables in `.env`
- Ensure port 3000 is not in use: `lsof -i :3000` (macOS/Linux)
- Check for missing dependencies: `npm install`

**Frontend can't connect to backend:**
- Verify `VITE_API_BASE_URL` in `frontend/.env`
- Ensure backend is running on the correct port
- Check browser console for CORS errors

**ZIP download fails:**
- Check `TEMP_DIR` exists and is writable
- Verify disk space is available
- Check backend logs for file system errors

**Tests failing:**
- Run `npm install` to ensure all dependencies are installed
- Check that test data files exist in `backend/data/`
- Verify TypeScript compilation: `npm run build`

### Debug Mode

Enable detailed logging by setting environment variables:

```bash
# Backend
NODE_ENV=development
DEBUG=mashup-maker:*

# Run with logging
npm run dev
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
