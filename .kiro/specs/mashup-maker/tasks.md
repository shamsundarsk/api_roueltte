# Implementation Plan

- [x] 1. Set up project structure and initialize repositories
  - Create monorepo structure with `/backend` and `/frontend` directories
  - Initialize Node.js project in backend with TypeScript, Express, and dependencies
  - Initialize React project in frontend with Vite and TypeScript
  - Set up ESLint, Prettier, and basic configuration files
  - Install testing frameworks: Jest and fast-check for backend
  - _Requirements: 2.4_

- [x] 2. Implement API Registry core functionality
  - Create APIMetadata TypeScript interface matching design specification
  - Implement APIRegistry class with methods: getAllAPIs, getAPIById, getAPIsByCategory, addAPI, validateAPI
  - Create initial JSON file with 50+ curated public APIs across diverse categories
  - Implement validation logic to ensure all required metadata fields are present
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 2.1 Write property test for API Registry validation
  - **Property 8: API Registry Metadata Completeness**
  - **Validates: Requirements 5.1, 5.4**

- [x] 2.2 Write property test for API Registry filtering
  - **Property 9: API Registry Filtering**
  - **Validates: Requirements 5.5**

- [x] 3. Implement API Selector component
  - Create APISelector class with selectAPIs method
  - Implement algorithm to select 3 unique APIs from different categories
  - Add ensureUniqueness and ensureDiversity validation methods
  - Handle edge cases: insufficient APIs, insufficient categories
  - _Requirements: 1.1, 1.2_

- [x] 3.1 Write property test for API selection constraints
  - **Property 1: API Selection Constraints**
  - **Validates: Requirements 1.1, 1.2**

- [x] 4. Implement Idea Generator component
  - Create AppIdea TypeScript interface
  - Implement IdeaGenerator class with generateIdea method
  - Create template-based generation for app names using API themes
  - Implement description generation (2-4 sentences)
  - Implement feature list generation (3-5 features leveraging all APIs)
  - Implement rationale generation explaining API synergy
  - _Requirements: 1.3, 10.1, 10.2, 10.3_

- [x] 4.1 Write property test for complete app idea structure
  - **Property 2: Complete App Idea Structure**
  - **Validates: Requirements 1.3, 1.5**

- [x] 4.2 Write property test for description length constraint
  - **Property 17: Description Length Constraint**
  - **Validates: Requirements 10.2**

- [x] 4.3 Write property test for feature count and coverage
  - **Property 18: Feature Count and Coverage**
  - **Validates: Requirements 10.3**

- [x] 5. Implement Code Generator component
  - Create GeneratedProject, BackendCode, and FrontendCode TypeScript interfaces
  - Implement CodeGenerator class with generateProject, generateBackend, generateFrontend methods
  - Create Handlebars templates for backend structure: server.js, routes, services, utils
  - Create Handlebars templates for frontend structure: App.jsx, components, services
  - Implement placeholder replacement logic for API names, endpoints, and metadata
  - Add inline comments explaining integration points for each API
  - Implement generateAPIStubs method for creating service files per API
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5.1 Write property test for complete code generation
  - **Property 3: Complete Code Generation**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 5.2 Write property test for valid syntax generation
  - **Property 4: Valid Syntax Generation**
  - **Validates: Requirements 2.5**

- [x] 6. Implement Mock Mode functionality
  - Add mock data generation logic in CodeGenerator
  - Implement Mock Mode activation based on authType (oauth, apikey)
  - Create sample JSON responses for common API patterns
  - Add integration instructions in generated code comments for real API setup
  - Add mock indicators in generated README documentation
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 6.1 Write property test for Mock Mode activation
  - **Property 10: Mock Mode Activation**
  - **Validates: Requirements 6.1**

- [x] 6.2 Write property test for Mock Mode code generation
  - **Property 11: Mock Mode Code Generation**
  - **Validates: Requirements 6.2, 6.3, 6.5**

- [x] 6.3 Write property test for graceful failure handling
  - **Property 12: Graceful Failure Handling**
  - **Validates: Requirements 6.4**

- [x] 7. Implement UI Layout Suggester component
  - Create UILayout, Screen, ComponentSuggestion, and InteractionFlow TypeScript interfaces
  - Implement UILayoutSuggester class with generateLayout method
  - Implement suggestScreens to analyze API capabilities and recommend 2-4 screens
  - Implement suggestComponents to map API response types to UI component types
  - Implement suggestInteractionFlow to describe navigation between screens
  - Ensure all three APIs are referenced in layout suggestions
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7.1 Write property test for complete UI layout suggestions
  - **Property 7: Complete UI Layout Suggestions**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 8. Implement ZIP Exporter component
  - Install and configure archiver library
  - Create ZIPExporter class with createArchive method
  - Implement file bundling into /backend and /frontend directories
  - Generate comprehensive README with app description, setup instructions, API notes
  - Implement filename generation based on app name (sanitized)
  - Add temporary file storage in /tmp directory
  - Implement cleanup logic for old ZIP files
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 8.1 Write property test for complete ZIP archive structure
  - **Property 5: Complete ZIP Archive Structure**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 8.2 Write property test for ZIP filename derivation
  - **Property 6: ZIP Filename Derivation**
  - **Validates: Requirements 3.5**

- [x] 9. Implement mashup generation pipeline
  - Create main mashup generation orchestrator that coordinates all components
  - Wire together: APISelector → IdeaGenerator → CodeGenerator → UILayoutSuggester → ZIPExporter
  - Implement error handling with try-catch blocks around each component
  - Add fallback logic to activate Mock Mode on API failures
  - Create MashupResponse interface and format response data
  - Generate unique mashup IDs
  - _Requirements: 1.3, 1.5, 6.4_

- [x] 10. Implement backend REST API endpoints
  - Create Express router for mashup endpoints
  - Implement POST /api/mashup/generate endpoint
  - Implement GET /api/mashup/download/:id endpoint with ZIP file streaming
  - Implement GET /api/registry/apis endpoint with filtering support
  - Implement POST /api/registry/apis endpoint for adding new APIs
  - Add request validation using Joi or Zod
  - Add error handling middleware
  - _Requirements: 5.5_

- [x] 11. Implement code preview functionality
  - Create code preview generator that extracts key snippets
  - Extract backend entry point (server.js) snippet
  - Extract frontend entry point (App.jsx) snippet
  - Generate folder structure tree representation
  - Mark API integration points in snippets with comments or markers
  - Include preview data in MashupResponse
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 11.1 Write property test for complete code preview
  - **Property 16: Complete Code Preview**
  - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 12. Implement regeneration functionality
  - Add tracking of previously selected APIs in session or request context
  - Modify APISelector to exclude previously selected APIs
  - Ensure regeneration executes complete pipeline
  - Return full MashupResponse with all components
  - _Requirements: 7.1, 7.2_

- [x] 12.1 Write property test for regeneration produces different results
  - **Property 13: Regeneration Produces Different Results**
  - **Validates: Requirements 7.1**

- [x] 12.2 Write property test for regeneration completeness
  - **Property 14: Regeneration Completeness**
  - **Validates: Requirements 7.2**

- [ ] 13. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise

- [x] 14. Implement frontend UI components
  - Create main App component with routing setup
  - Create GenerateButton component as primary action
  - Create LoadingSpinner component for generation feedback
  - Create APICard component to display selected API metadata
  - Create IdeaDisplay component for app concept
  - Create CodePreview component with collapsible sections
  - Create UILayoutDisplay component for layout suggestions
  - Create DownloadButton component
  - Create RegenerateButton component
  - _Requirements: 8.1, 8.4, 8.5_

- [x] 15. Implement frontend state management
  - Set up React Context for mashup state
  - Create actions for: generate, regenerate, download
  - Implement loading states during async operations
  - Handle error states and display error messages
  - Store current mashup data in context
  - _Requirements: 8.2, 8.3_

- [x] 16. Implement frontend API service
  - Create API service module using Axios
  - Implement generateMashup function calling POST /api/mashup/generate
  - Implement downloadMashup function calling GET /api/mashup/download/:id
  - Implement getAPIs function calling GET /api/registry/apis
  - Add error handling and response parsing
  - Configure base URL from environment variables
  - _Requirements: 1.1_

- [x] 17. Implement frontend results display
  - Create MashupResults component as main results container
  - Display three selected APIs with metadata using APICard components
  - Display app idea with name, description, features, rationale
  - Display code preview with folder structure and snippets
  - Display UI layout suggestions with screens, components, flow
  - Show Download and Regenerate buttons
  - _Requirements: 1.5, 8.4, 9.1, 9.2_

- [x] 17.1 Write property test for results display completeness
  - **Property 15: Results Display Completeness**
  - **Validates: Requirements 8.4**

- [x] 18. Implement frontend download functionality
  - Handle download button click
  - Trigger file download using download URL from backend
  - Show download progress or success feedback
  - Handle download errors gracefully
  - _Requirements: 3.1_

- [x] 19. Implement frontend regeneration functionality
  - Handle regenerate button click
  - Call generateMashup API with previous API IDs to exclude
  - Replace all displayed content with new mashup data
  - Maintain UI state without page reload
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 20. Add styling and responsive design
  - Apply CSS styling to all components
  - Ensure responsive layout for mobile and desktop
  - Style Generate button prominently as primary action
  - Style API cards with clear visual hierarchy
  - Style code preview with syntax-like formatting
  - Add loading animations and transitions
  - _Requirements: 8.1_

- [x] 21. Implement environment configuration
  - Create .env.example files for backend and frontend
  - Configure PORT, NODE_ENV, TEMP_DIR for backend
  - Configure VITE_API_BASE_URL for frontend
  - Add environment variable validation on startup
  - Document all environment variables in README
  - _Requirements: 2.1, 2.2_

- [ ] 22. Implement file cleanup and maintenance
  - Create cleanup service for old ZIP files
  - Schedule cleanup to run every 24 hours
  - Delete ZIP files older than 24 hours
  - Add logging for cleanup operations
  - Handle cleanup errors gracefully
  - _Requirements: 3.4_

- [x] 23. Add comprehensive error handling
  - Implement error handling for API Registry errors
  - Implement error handling for generation errors
  - Implement error handling for file system errors
  - Create ErrorResponse interface
  - Return meaningful error messages to frontend
  - Log errors for debugging
  - _Requirements: 6.4_

- [x] 24. Create project documentation
  - Write main README with project overview and setup instructions
  - Document API endpoints with request/response examples
  - Document how to add new APIs to registry
  - Document code generation templates and customization
  - Add inline code documentation and JSDoc comments
  - Create CONTRIBUTING.md for future contributors
  - _Requirements: 3.2_

- [ ] 25. Final checkpoint - Ensure all tests pass and application runs end-to-end
  - Ensure all tests pass, ask the user if questions arise
