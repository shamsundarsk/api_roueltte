/**
 * API Metadata interface
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
 * App Idea interface
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
 * Flow step describing navigation
 */
export interface FlowStep {
  from: string;
  to: string;
  action: string;
}

/**
 * Interaction flow
 */
export interface InteractionFlow {
  steps: FlowStep[];
}

/**
 * UI Layout suggestion
 */
export interface UILayout {
  screens: Screen[];
  components: ComponentSuggestion[];
  interactionFlow: InteractionFlow;
}

/**
 * Code preview
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
