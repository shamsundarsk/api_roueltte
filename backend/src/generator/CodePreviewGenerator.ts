import {
  GeneratedProject,
  CodePreview,
  FileStructure,
} from '../types';

/**
 * CodePreviewGenerator creates code previews with marked API integration points
 * Validates: Requirements 9.1, 9.2, 9.3
 */
export class CodePreviewGenerator {
  /**
   * Generate a complete code preview from a generated project
   * Validates: Requirements 9.1, 9.2, 9.3
   * 
   * @param project - The generated project
   * @returns CodePreview with snippets and structure
   */
  generatePreview(project: GeneratedProject): CodePreview {
    // Extract backend entry point snippet
    const backendSnippet = this.extractBackendSnippet(project);

    // Extract frontend entry point snippet
    const frontendSnippet = this.extractFrontendSnippet(project);

    // Build combined folder structure
    const structure = this.buildCombinedStructure(project);

    return {
      backendSnippet,
      frontendSnippet,
      structure,
    };
  }

  /**
   * Extract backend entry point snippet with marked API integration points
   * Validates: Requirement 9.2, 9.3
   * 
   * @param project - The generated project
   * @returns Backend code snippet
   */
  private extractBackendSnippet(project: GeneratedProject): string {
    const serverFile = project.backend.files.get('src/server.js');
    
    if (serverFile === undefined) {
      return '// Backend entry point not found';
    }

    // Extract first 40 lines to show the main server setup
    const snippet = this.extractLines(serverFile, 40);

    // Mark API integration points
    return this.markIntegrationPoints(snippet);
  }

  /**
   * Extract frontend entry point snippet with marked API integration points
   * Validates: Requirement 9.2, 9.3
   * 
   * @param project - The generated project
   * @returns Frontend code snippet
   */
  private extractFrontendSnippet(project: GeneratedProject): string {
    const appFile = project.frontend.files.get('src/App.jsx');
    
    if (appFile === undefined) {
      return '// Frontend entry point not found';
    }

    // Extract first 40 lines to show the main app structure
    const snippet = this.extractLines(appFile, 40);

    // Mark API integration points
    return this.markIntegrationPoints(snippet);
  }

  /**
   * Build combined folder structure tree
   * Validates: Requirement 9.1
   * 
   * @param project - The generated project
   * @returns Combined file structure
   */
  private buildCombinedStructure(project: GeneratedProject): FileStructure {
    return {
      name: 'project',
      type: 'directory',
      children: [
        project.backend.structure,
        project.frontend.structure,
        {
          name: 'README.md',
          type: 'file',
        },
      ],
    };
  }

  /**
   * Extract first N lines from code
   * 
   * @param code - Full code content
   * @param lines - Number of lines to extract
   * @returns Code snippet
   */
  private extractLines(code: string, lines: number): string {
    const codeLines = code.split('\n');
    const extracted = codeLines.slice(0, lines);
    
    // Add ellipsis if there are more lines
    if (codeLines.length > lines) {
      extracted.push('// ... (more code below)');
    }
    
    return extracted.join('\n');
  }

  /**
   * Mark API integration points in code snippets
   * Adds visual markers to highlight where APIs are integrated
   * Validates: Requirement 9.3
   * 
   * @param code - Code snippet
   * @returns Code with marked integration points
   */
  private markIntegrationPoints(code: string): string {
    // The code already contains "API Integration Point:" comments
    // We'll enhance them with visual markers
    return code.replace(
      /(\/\/.*API Integration Point:.*)/g,
      '>>> $1 <<<'
    ).replace(
      /(\/\*.*API Integration Point:.*\*\/)/g,
      '>>> $1 <<<'
    ).replace(
      /(\{\/\*.*API Integration Point:.*\*\/\})/g,
      '>>> $1 <<<'
    );
  }
}
