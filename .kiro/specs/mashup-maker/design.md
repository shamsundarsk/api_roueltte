# Design Document

## Overview

Mashup Maker is a web-based application that generates creative app concepts by combining three randomly selected APIs from a curated registry. The system consists of a React frontend and Node.js/Express backend, with components for API selection, idea generation, code scaffolding, UI layout suggestions, and project export functionality.

The architecture follows a modular design where each major component (API Registry, Idea Generator, Code Generator, UI Layout Suggester, ZIP Exporter) operates independently but communicates through well-defined interfaces. This enables easy extension and maintenance as the system grows to support more APIs, frameworks, and templates.

## Architecture

### High-Level Architecture

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
│  │              (JSON file or SQLite DB)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. User clicks "Generate Mashup" button in React frontend
2. Frontend sends POST request to `/api/mashup/generate`
3. Backend API Selector queries API Registry for three unique APIs from different categories
4. Idea Generator receives API metadata and produces app concept using template-based generation
5. Code Generator creates backend and frontend boilerplates with API integration stubs
6. UI Layout Suggester analyzes API capabilities and generates layout recommendations
7. ZIP Exporter bundles all generated files into a downloadable archive
8. Backend returns complete mashup data (APIs, idea, code, UI suggestions, ZIP URL) to frontend
9. Frontend displays results and enables download

## Components and Interfaces

### 1. API Registry

**Responsibility:** Store and retrieve metadata for curated public APIs

**Data Structure:**
```typescript
interface APIMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  sampleEndpoint: string;
  authType: 'none' | 'apikey' | 'oauth';
  corsCompatible: boolean;
  mockData?: object;
  documentationUrl: string;
}
```

**Interface:**
```typescript
class APIRegistry {
  getAllAPIs(): APIMetadata[];
  getAPIById(id: string): APIMetadata | null;
  getAPIsByCategory(category: string): APIMetadata[];
  addAPI(api: APIMetadata): void;
  validateAPI(api: APIMetadata): boolean;
}
```

**Implementation Notes:**
- Initial implementation uses a JSON file for simplicity
- Can be migrated to SQLite or PostgreSQL for scalability
- Includes validation to ensure all required fields are present
- Supports filtering by category and authentication type

### 2. API Selector

**Responsibility:** Select three unique APIs from different categories for mashup generation

**Interface:**
```typescript
class APISelector {
  selectAPIs(count: number, options?: SelectionOptions): APIMetadata[];
  ensureUniqueness(apis: APIMetadata[]): boolean;
  ensureDiversity(apis: APIMetadata[]): boolean;
}

interface SelectionOptions {
  excludeCategories?: string[];
  requireAuth?: boolean;
  corsOnly?: boolean;
}
```

**Algorithm:**
- Retrieve all available APIs from registry
- Group APIs by category
- Randomly select one API from three different categories
- Validate that all three APIs are unique
- Return selected APIs with full metadata

### 3. Idea Generator

**Responsibility:** Generate creative app concepts from API combinations

**Interface:**
```typescript
class IdeaGenerator {
  generateIdea(apis: APIMetadata[]): AppIdea;
  generateAppName(apis: APIMetadata[]): string;
  generateDescription(apis: APIMetadata[]): string;
  generateFeatures(apis: APIMetadata[]): string[];
  generateRationale(apis: APIMetadata[]): string;
}

interface AppIdea {
  appName: string;
  description: string;
  features: string[];
  rationale: string;
  apis: APIMetadata[];
}
```

**Implementation Strategy:**
- Use template-based generation with structured prompts
- Templates include placeholders for API names, categories, and capabilities
- Generate app names by combining API themes (e.g., "Weather + Music + Maps" → "SoundScape Navigator")
- Features list leverages specific endpoints from each API
- Rationale explains synergy between the three APIs

### 4. Code Generator

**Responsibility:** Create backend and frontend code scaffolding with API integration stubs

**Interface:**
```typescript
class CodeGenerator {
  generateProject(idea: AppIdea): GeneratedProject;
  generateBackend(apis: APIMetadata[]): BackendCode;
  generateFrontend(idea: AppIdea): FrontendCode;
  generateAPIStubs(api: APIMetadata): string;
  generateMockData(api: APIMetadata): object;
}

interface GeneratedProject {
  backend: BackendCode;
  frontend: FrontendCode;
  readme: string;
}

interface BackendCode {
  structure: FileStructure;
  files: Map<string, string>;
}

interface FrontendCode {
  structure: FileStructure;
  files: Map<string, string>;
}
```

**Backend Structure:**
```
/backend
  /src
    /routes
      - mashup.routes.js
    /services
      - api1.service.js
      - api2.service.js
      - api3.service.js
    /utils
      - apiClient.js
    - server.js
  - package.json
  - .env.example
```

**Frontend Structure:**
```
/frontend
  /src
    /components
      - API1Component.jsx
      - API2Component.jsx
      - API3Component.jsx
      - Dashboard.jsx
    /services
      - api.service.js
    - App.jsx
    - index.js
  - package.json
  - .env.example
```

**Code Generation Strategy:**
- Use template files with placeholder markers (e.g., `{{API_NAME}}`, `{{ENDPOINT}}`)
- Replace placeholders with actual API metadata
- Include inline comments explaining integration points
- Add TODO markers for developer customization
- Generate mock data for APIs requiring authentication
- Ensure all generated code has valid syntax

### 5. UI Layout Suggester

**Responsibility:** Provide wireframe descriptions and component layout recommendations

**Interface:**
```typescript
class UILayoutSuggester {
  generateLayout(idea: AppIdea): UILayout;
  suggestScreens(apis: APIMetadata[]): Screen[];
  suggestComponents(api: APIMetadata): ComponentSuggestion[];
  suggestInteractionFlow(screens: Screen[]): InteractionFlow;
}

interface UILayout {
  screens: Screen[];
  components: ComponentSuggestion[];
  interactionFlow: InteractionFlow;
}

interface Screen {
  name: string;
  description: string;
  components: string[];
}

interface ComponentSuggestion {
  type: 'card' | 'list' | 'chart' | 'form' | 'map' | 'player';
  purpose: string;
  apiSource: string;
}

interface InteractionFlow {
  steps: FlowStep[];
}

interface FlowStep {
  from: string;
  to: string;
  action: string;
}
```

**Layout Generation Strategy:**
- Analyze API capabilities to determine appropriate UI components
- Map API response types to component types (e.g., list data → list component, location data → map)
- Suggest 2-4 main screens based on API count and functionality
- Describe interaction flow from landing page through feature usage
- Provide component hierarchy for each screen

### 6. ZIP Exporter

**Responsibility:** Bundle generated files into a downloadable ZIP archive

**Interface:**
```typescript
class ZIPExporter {
  createArchive(project: GeneratedProject, idea: AppIdea): Promise<string>;
  addFilesToArchive(files: Map<string, string>, basePath: string): void;
  generateReadme(idea: AppIdea): string;
  saveArchive(filename: string): Promise<string>;
}
```

**Implementation:**
- Use `archiver` library for ZIP creation
- Organize files into `/backend` and `/frontend` directories
- Generate comprehensive README with:
  - App concept description
  - Setup instructions for backend and frontend
  - API integration notes for each API
  - Mock data explanations
  - Next steps for development
- Store ZIP files temporarily in `/tmp` directory
- Return download URL to frontend
- Clean up old ZIP files periodically

## Data Models

### API Metadata Model

```typescript
interface APIMetadata {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "OpenWeather API")
  description: string;           // Brief description of API functionality
  category: string;              // Category (e.g., "weather", "music", "maps")
  baseUrl: string;              // Base URL for API requests
  sampleEndpoint: string;       // Example endpoint path
  authType: 'none' | 'apikey' | 'oauth';  // Authentication requirement
  corsCompatible: boolean;      // Whether API supports CORS
  mockData?: object;            // Sample response data for mock mode
  documentationUrl: string;     // Link to API documentation
}
```

### App Idea Model

```typescript
interface AppIdea {
  appName: string;              // Generated app name
  description: string;          // 2-4 sentence concept description
  features: string[];           // 3-5 key user features
  rationale: string;            // Explanation of why APIs work together
  apis: APIMetadata[];          // The three selected APIs
}
```

### Generated Project Model

```typescript
interface GeneratedProject {
  backend: {
    structure: FileStructure;
    files: Map<string, string>;  // filepath -> content
  };
  frontend: {
    structure: FileStructure;
    files: Map<string, string>;  // filepath -> content
  };
  readme: string;
}

interface FileStructure {
  name: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}
```

### Mashup Response Model

```typescript
interface MashupResponse {
  id: string;                   // Unique mashup ID
  idea: AppIdea;                // Generated app concept
  uiLayout: UILayout;           // UI suggestions
  codePreview: {
    backendSnippet: string;
    frontendSnippet: string;
    structure: FileStructure;
  };
  downloadUrl: string;          // URL to download ZIP
  timestamp: number;            // Generation timestamp
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Selection Constraints

*For any* mashup generation request with a registry containing at least 3 categories with at least one API each, the selected APIs should be exactly 3 in count, all unique, and each from a different category.

**Validates: Requirements 1.1, 1.2**

### Property 2: Complete App Idea Structure

*For any* set of three APIs, the generated app idea should contain a non-empty app name, a description, a features list, a rationale, and references to all three input APIs.

**Validates: Requirements 1.3, 1.5**

### Property 3: Complete Code Generation

*For any* generated project, the backend code should contain API service files for all three APIs with integration comments, and the frontend code should contain component files with routing templates.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: Valid Syntax Generation

*For any* generated JavaScript or JSX file, parsing the file content with a JavaScript parser should succeed without syntax errors.

**Validates: Requirements 2.5**

### Property 5: Complete ZIP Archive Structure

*For any* generated project, the ZIP archive should contain all generated files organized into separate `/backend` and `/frontend` directories, and include a README file with setup instructions.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: ZIP Filename Derivation

*For any* generated mashup with app name N, the ZIP filename should be derived from N (e.g., sanitized and formatted).

**Validates: Requirements 3.5**

### Property 7: Complete UI Layout Suggestions

*For any* generated mashup, the UI layout suggestions should include screen descriptions, component type specifications, interaction flow descriptions, and references to all three APIs.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 8: API Registry Metadata Completeness

*For any* API added to the registry, if validation succeeds, then the stored API should contain all required fields: name, description, category, baseUrl, sampleEndpoint, authType, corsCompatible, and documentationUrl.

**Validates: Requirements 5.1, 5.4**

### Property 9: API Registry Filtering

*For any* filter criteria (category or auth type), the APIs returned by the registry should all match the specified filter criteria.

**Validates: Requirements 5.5**

### Property 10: Mock Mode Activation

*For any* API with authType 'oauth' or 'apikey', the system should activate Mock Mode for that API during mashup generation.

**Validates: Requirements 6.1**

### Property 11: Mock Mode Code Generation

*For any* API in Mock Mode, the generated code should include sample JSON mock data, integration instructions for the real API, and documentation indicating mock status.

**Validates: Requirements 6.2, 6.3, 6.5**

### Property 12: Graceful Failure Handling

*For any* API that fails during generation, the mashup generation process should complete successfully with mock data substituted for the failed API.

**Validates: Requirements 6.4**

### Property 13: Regeneration Produces Different Results

*For any* two consecutive regeneration requests, the second set of selected APIs should be different from the first set.

**Validates: Requirements 7.1**

### Property 14: Regeneration Completeness

*For any* regeneration request, the output should contain all the same components as initial generation: app idea, code, UI suggestions, and download URL.

**Validates: Requirements 7.2**

### Property 15: Results Display Completeness

*For any* mashup generation response, the displayed results should include all components: the three APIs with metadata, app idea, code preview, and UI suggestions.

**Validates: Requirements 8.4**

### Property 16: Complete Code Preview

*For any* generated mashup, the code preview should include the folder structure, backend entry point snippet, frontend entry point snippet, and marked API integration points.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 17: Description Length Constraint

*For any* generated app idea, the description should contain between 2 and 4 sentences.

**Validates: Requirements 10.2**

### Property 18: Feature Count and Coverage

*For any* generated app idea, the features list should contain between 3 and 5 features, and all three APIs should be referenced across the features.

**Validates: Requirements 10.3**

## Error Handling

### Error Categories

1. **API Registry Errors**
   - Missing or invalid API metadata
   - Insufficient APIs for selection
   - Category distribution issues

2. **Generation Errors**
   - Template rendering failures
   - Invalid API combinations
   - Code generation syntax errors

3. **External API Errors**
   - API unavailability
   - Authentication failures
   - Rate limiting

4. **File System Errors**
   - ZIP creation failures
   - Temporary file cleanup issues
   - Disk space limitations

### Error Handling Strategies

**API Registry Errors:**
- Validate all API metadata on addition
- Return descriptive error messages for validation failures
- Ensure minimum API count before allowing mashup generation
- Log invalid API entries for administrator review

**Generation Errors:**
- Wrap all generation steps in try-catch blocks
- Provide fallback templates if primary templates fail
- Validate generated code syntax before returning
- Return partial results with error indicators if some components fail

**External API Errors:**
- Implement automatic Mock Mode activation for unavailable APIs
- Set reasonable timeouts for API health checks
- Cache API availability status to avoid repeated failures
- Include clear documentation about mock data usage

**File System Errors:**
- Implement retry logic for temporary failures
- Provide meaningful error messages to users
- Clean up partial files on failure
- Monitor disk space and warn administrators

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  partialResult?: Partial<MashupResponse>;
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and error conditions for individual components:

**API Registry Tests:**
- Test adding valid and invalid APIs
- Test filtering by category and auth type
- Test retrieval of specific APIs by ID
- Edge case: Empty registry
- Edge case: Registry with single category

**API Selector Tests:**
- Test selection with sufficient APIs
- Test selection with insufficient categories
- Edge case: Exactly 3 categories available
- Edge case: Multiple APIs in same category

**Idea Generator Tests:**
- Test idea generation with various API combinations
- Test app name generation
- Edge case: APIs with very long names
- Edge case: APIs with special characters in names

**Code Generator Tests:**
- Test backend generation with different API types
- Test frontend generation with various frameworks
- Test mock data insertion
- Edge case: APIs with no sample endpoints
- Edge case: All APIs requiring authentication

**UI Layout Suggester Tests:**
- Test layout generation for different API types
- Test component suggestions based on API capabilities
- Edge case: APIs with minimal metadata

**ZIP Exporter Tests:**
- Test archive creation with complete projects
- Test README generation
- Edge case: Very large projects
- Edge case: Special characters in filenames

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using a PBT library. For JavaScript/Node.js, we will use **fast-check** as the property-based testing framework.

**Configuration:**
- Each property-based test should run a minimum of 100 iterations
- Tests should use smart generators that constrain inputs to valid ranges
- Each test must be tagged with a comment referencing the correctness property

**Test Tag Format:**
```javascript
// Feature: mashup-maker, Property 1: API Selection Constraints
```

**Property Test Examples:**

1. **API Selection Constraints** - Generate random API registries and verify selection always returns 3 unique APIs from different categories

2. **Complete App Idea Structure** - Generate random API sets and verify all idea components are present

3. **Valid Syntax Generation** - Generate random projects and parse all JavaScript files to verify syntax validity

4. **Mock Mode Activation** - Generate random API sets with various auth types and verify Mock Mode activates correctly

5. **Regeneration Produces Different Results** - Generate multiple consecutive mashups and verify uniqueness

**Generators:**
- `arbitraryAPIMetadata()` - Generates valid API metadata objects
- `arbitraryAPIRegistry(minAPIs, minCategories)` - Generates registries with constraints
- `arbitraryAppIdea()` - Generates valid app ideas
- `arbitraryAuthType()` - Generates auth type values

### Integration Testing

Integration tests will verify component interactions:

- Test complete mashup generation pipeline from API selection to ZIP export
- Test frontend-backend communication via REST API
- Test error propagation through the pipeline
- Test Mock Mode activation and fallback behavior

### Test Execution

- Unit tests and property tests run on every commit
- Integration tests run before merges to main branch
- All tests must pass before deployment
- Test coverage target: 80% for core business logic


## API Endpoints

### POST /api/mashup/generate

Generate a new mashup with three random APIs.

**Request:**
```json
{
  "options": {
    "excludeCategories": ["weather"],
    "corsOnly": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mashup_abc123",
    "idea": {
      "appName": "Weather Music Navigator",
      "description": "An app that plays music based on current weather...",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "rationale": "These APIs work together because...",
      "apis": [...]
    },
    "uiLayout": {
      "screens": [...],
      "components": [...],
      "interactionFlow": {...}
    },
    "codePreview": {
      "backendSnippet": "...",
      "frontendSnippet": "...",
      "structure": {...}
    },
    "downloadUrl": "/api/mashup/download/mashup_abc123",
    "timestamp": 1701360000000
  }
}
```

### GET /api/mashup/download/:id

Download the ZIP archive for a generated mashup.

**Response:**
- Content-Type: application/zip
- Content-Disposition: attachment; filename="weather-music-navigator.zip"
- Binary ZIP file data

### GET /api/registry/apis

Retrieve all APIs from the registry.

**Query Parameters:**
- `category` (optional): Filter by category
- `authType` (optional): Filter by authentication type

**Response:**
```json
{
  "success": true,
  "data": {
    "apis": [...],
    "count": 50
  }
}
```

### POST /api/registry/apis

Add a new API to the registry (admin only).

**Request:**
```json
{
  "name": "New API",
  "description": "Description",
  "category": "weather",
  "baseUrl": "https://api.example.com",
  "sampleEndpoint": "/v1/data",
  "authType": "apikey",
  "corsCompatible": true,
  "documentationUrl": "https://docs.example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "api_xyz789",
    "message": "API added successfully"
  }
}
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Template Engine:** Handlebars (for code generation)
- **ZIP Library:** archiver
- **Testing:** Jest + fast-check (for property-based testing)
- **Validation:** Joi or Zod
- **File System:** fs-extra

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **UI Components:** Custom components (minimal dependencies)
- **State Management:** React Context API
- **Styling:** CSS Modules or Tailwind CSS

### Data Storage
- **Initial:** JSON file for API registry
- **Future:** SQLite or PostgreSQL for scalability

### Development Tools
- **Language:** TypeScript
- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git

## Deployment Considerations

### Environment Variables

```bash
# Backend
PORT=3000
NODE_ENV=production
TEMP_DIR=/tmp/mashup-maker
MAX_ZIP_SIZE_MB=50
CLEANUP_INTERVAL_HOURS=24

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

### File Storage

- Generated ZIP files stored in temporary directory
- Automatic cleanup of files older than 24 hours
- Maximum ZIP size limit to prevent abuse

### Performance Optimization

- Cache API registry in memory
- Lazy load code templates
- Stream ZIP file generation for large projects
- Implement rate limiting on generation endpoint

### Security Considerations

- Validate all user inputs
- Sanitize filenames to prevent path traversal
- Limit ZIP file size to prevent DoS
- Implement rate limiting per IP address
- No authentication required for MVP (add in future versions)

## Future Enhancements

### Phase 2 Features

1. **API Filtering UI**
   - Allow users to select preferred categories
   - Filter by authentication requirements
   - Exclude specific APIs

2. **Multiple Framework Support**
   - Python + FastAPI backend option
   - Next.js frontend option
   - Vue.js frontend option

3. **Enhanced Code Generation**
   - More sophisticated templates
   - Environment variable management
   - Docker configuration files

4. **Mashup Gallery**
   - Save and share generated mashups
   - "Mashup of the Day" feature
   - Community voting and ratings

5. **Collaboration Features**
   - Team workspaces
   - Shared mashup collections
   - Comments and feedback

### Phase 3 Features

1. **Advanced API Integration**
   - OAuth flow generation
   - API key management
   - Webhook setup

2. **Code Editor**
   - In-browser code editing
   - Live preview
   - Syntax highlighting

3. **Deployment Integration**
   - One-click deploy to Vercel/Netlify
   - GitHub repository creation
   - CI/CD pipeline setup

## Glossary

- **Mashup:** A generated app concept combining three APIs
- **Boilerplate:** Pre-structured code templates
- **Mock Mode:** Fallback mechanism using sample data
- **API Registry:** Database of curated API metadata
- **Code Scaffolding:** Generated project structure with placeholders
- **Property-Based Testing:** Testing approach that verifies properties across many generated inputs
- **EARS:** Easy Approach to Requirements Syntax
- **INCOSE:** International Council on Systems Engineering
