/**
 * API Metadata interface matching design specification
 */
export interface APIMetadata {
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

/**
 * Options for API selection
 */
export interface SelectionOptions {
  excludeCategories?: string[];
  requireAuth?: boolean;
  corsOnly?: boolean;
  excludeAPIIds?: string[];
}

/**
 * App Idea interface representing a generated app concept
 */
export interface AppIdea {
  appName: string;
  description: string;
  features: string[];
  rationale: string;
  apis: APIMetadata[];
}

/**
 * File structure representation
 */
export interface FileStructure {
  name: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

/**
 * Backend code structure
 */
export interface BackendCode {
  structure: FileStructure;
  files: Map<string, string>;
}

/**
 * Frontend code structure
 */
export interface FrontendCode {
  structure: FileStructure;
  files: Map<string, string>;
}

/**
 * Generated project containing backend and frontend code
 */
export interface GeneratedProject {
  backend: BackendCode;
  frontend: FrontendCode;
  readme: string;
}

/**
 * Component suggestion for UI layout
 */
export interface ComponentSuggestion {
  type: 'card' | 'list' | 'chart' | 'form' | 'map' | 'player';
  purpose: string;
  apiSource: string;
}

/**
 * Screen description for UI layout
 */
export interface Screen {
  name: string;
  description: string;
  components: string[];
}

/**
 * Flow step describing navigation between screens
 */
export interface FlowStep {
  from: string;
  to: string;
  action: string;
}

/**
 * Interaction flow describing navigation between screens
 */
export interface InteractionFlow {
  steps: FlowStep[];
}

/**
 * Complete UI layout suggestion
 */
export interface UILayout {
  screens: Screen[];
  components: ComponentSuggestion[];
  interactionFlow: InteractionFlow;
}

/**
 * Code preview for displaying in UI
 */
export interface CodePreview {
  backendSnippet: string;
  frontendSnippet: string;
  structure: FileStructure;
}

/**
 * Complete mashup response
 */
export interface MashupResponse {
  id: string;
  idea: AppIdea;
  uiLayout: UILayout;
  codePreview: CodePreview;
  downloadUrl: string;
  timestamp: number;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  partialResult?: Partial<MashupResponse>;
}
