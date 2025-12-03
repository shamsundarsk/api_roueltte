import { APIRegistry } from '../registry/APIRegistry';
import { APISelector } from '../selector/APISelector';
import { IdeaGenerator } from '../generator/IdeaGenerator';
import { CodeGenerator } from '../generator/CodeGenerator';
import { UILayoutSuggester } from '../generator/UILayoutSuggester';
import { CodePreviewGenerator } from '../generator/CodePreviewGenerator';
import { ZIPExporter } from '../exporter/ZIPExporter';
import {
  SelectionOptions,
  MashupResponse,
  ErrorResponse,
  APIMetadata,
} from '../types/api.types';
import { PipelineError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * MashupPipeline orchestrates all components to generate complete mashups
 * Validates: Requirements 1.3, 1.5, 6.4
 */
export class MashupPipeline {
  private registry: APIRegistry;
  private selector: APISelector;
  private ideaGenerator: IdeaGenerator;
  private codeGenerator: CodeGenerator;
  private uiLayoutSuggester: UILayoutSuggester;
  private codePreviewGenerator: CodePreviewGenerator;
  private zipExporter: ZIPExporter;

  constructor(
    registryPath?: string,
    tempDir?: string
  ) {
    this.registry = new APIRegistry(registryPath);
    this.selector = new APISelector(this.registry);
    this.ideaGenerator = new IdeaGenerator();
    this.codeGenerator = new CodeGenerator();
    this.uiLayoutSuggester = new UILayoutSuggester();
    this.codePreviewGenerator = new CodePreviewGenerator();
    this.zipExporter = new ZIPExporter(tempDir);
  }

  /**
   * Generate a complete mashup with all components
   * Implements error handling with fallback to Mock Mode
   * Validates: Requirements 1.3, 1.5, 6.4
   * 
   * @param options - Optional selection criteria
   * @returns Promise resolving to MashupResponse or ErrorResponse
   */
  async generateMashup(
    options?: SelectionOptions
  ): Promise<MashupResponse | ErrorResponse> {
    const mashupId = this.generateMashupId();
    const timestamp = Date.now();
    let partialResult: Partial<MashupResponse> = {
      id: mashupId,
      timestamp,
    };

    try {
      // Step 1: Select APIs
      let selectedAPIs: APIMetadata[];
      try {
        selectedAPIs = this.selector.selectAPIs(3, options);
        logger.logInfo(`Selected ${selectedAPIs.length} APIs for mashup ${mashupId}`, {
          apis: selectedAPIs.map(api => ({ id: api.id, name: api.name })),
        });
      } catch (error) {
        logger.logError(
          new PipelineError('API selection failed', 'API_SELECTION', {
            mashupId,
            options,
            originalError: error instanceof Error ? error.message : String(error),
          })
        );
        return this.createErrorResponse(
          'API_SELECTION_FAILED',
          'Failed to select APIs for mashup generation',
          error,
          partialResult
        );
      }

      // Step 2: Generate App Idea
      try {
        const idea = this.ideaGenerator.generateIdea(selectedAPIs);
        partialResult.idea = idea;
        logger.logInfo(`Generated app idea: ${idea.appName}`, { mashupId });
      } catch (error) {
        // Activate Mock Mode fallback if idea generation fails
        logger.logWarning('Idea generation failed, attempting with mock mode fallback', {
          mashupId,
          originalError: error instanceof Error ? error.message : String(error),
        });
        try {
          const mockAPIs = this.activateMockMode(selectedAPIs);
          const idea = this.ideaGenerator.generateIdea(mockAPIs);
          partialResult.idea = idea;
          logger.logInfo(`Generated app idea with mock mode: ${idea.appName}`, { mashupId });
        } catch (fallbackError) {
          logger.logError(
            new PipelineError('Idea generation failed', 'IDEA_GENERATION', {
              mashupId,
              originalError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
            })
          );
          return this.createErrorResponse(
            'IDEA_GENERATION_FAILED',
            'Failed to generate app idea',
            fallbackError,
            partialResult
          );
        }
      }

      // Step 3: Generate Code
      let generatedProject;
      try {
        generatedProject = this.codeGenerator.generateProject(partialResult.idea!);
        logger.logInfo(`Generated code for ${partialResult.idea!.appName}`, { mashupId });
      } catch (error) {
        // Activate Mock Mode fallback if code generation fails
        logger.logWarning('Code generation failed, attempting with mock mode fallback', {
          mashupId,
          appName: partialResult.idea!.appName,
          originalError: error instanceof Error ? error.message : String(error),
        });
        try {
          const mockIdea = {
            ...partialResult.idea!,
            apis: this.activateMockMode(partialResult.idea!.apis),
          };
          generatedProject = this.codeGenerator.generateProject(mockIdea);
          partialResult.idea = mockIdea;
          logger.logInfo(`Generated code with mock mode for ${mockIdea.appName}`, { mashupId });
        } catch (fallbackError) {
          logger.logError(
            new PipelineError('Code generation failed', 'CODE_GENERATION', {
              mashupId,
              appName: partialResult.idea!.appName,
              originalError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
            })
          );
          return this.createErrorResponse(
            'CODE_GENERATION_FAILED',
            'Failed to generate code',
            fallbackError,
            partialResult
          );
        }
      }

      // Step 4: Generate UI Layout Suggestions
      try {
        const uiLayout = this.uiLayoutSuggester.generateLayout(partialResult.idea!);
        partialResult.uiLayout = uiLayout;
        logger.logInfo(`Generated UI layout with ${uiLayout.screens.length} screens`, { mashupId });
      } catch (error) {
        // UI layout is not critical, continue with partial result
        logger.logWarning('UI layout generation failed, continuing without it', {
          mashupId,
          originalError: error instanceof Error ? error.message : String(error),
        });
        partialResult.uiLayout = {
          screens: [],
          components: [],
          interactionFlow: { steps: [] },
        };
      }

      // Step 5: Create Code Preview
      try {
        const codePreview = this.codePreviewGenerator.generatePreview(generatedProject);
        partialResult.codePreview = codePreview;
        logger.logInfo('Generated code preview with marked integration points', { mashupId });
      } catch (error) {
        logger.logWarning('Code preview generation failed, using empty preview', {
          mashupId,
          originalError: error instanceof Error ? error.message : String(error),
        });
        partialResult.codePreview = {
          backendSnippet: '',
          frontendSnippet: '',
          structure: { name: 'project', type: 'directory', children: [] },
        };
      }

      // Step 6: Export to ZIP
      let zipPath: string;
      try {
        zipPath = await this.zipExporter.createArchive(
          generatedProject,
          partialResult.idea!
        );
        const filename = this.zipExporter.getFilename(zipPath);
        partialResult.downloadUrl = `/api/mashup/download/${filename}`;
        logger.logInfo(`Created ZIP archive: ${filename}`, { mashupId });
      } catch (error) {
        logger.logError(
          new PipelineError('ZIP export failed', 'ZIP_EXPORT', {
            mashupId,
            appName: partialResult.idea!.appName,
            originalError: error instanceof Error ? error.message : String(error),
          })
        );
        return this.createErrorResponse(
          'ZIP_EXPORT_FAILED',
          'Failed to create downloadable archive',
          error,
          partialResult
        );
      }

      // Return complete mashup response
      logger.logInfo('Mashup generation completed successfully', {
        mashupId,
        appName: partialResult.idea!.appName,
      });
      return partialResult as MashupResponse;
    } catch (error) {
      // Catch-all for unexpected errors
      logger.logError(
        new PipelineError('Unexpected error during mashup generation', 'UNEXPECTED', {
          mashupId,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      return this.createErrorResponse(
        'UNEXPECTED_ERROR',
        'An unexpected error occurred during mashup generation',
        error,
        partialResult
      );
    }
  }

  /**
   * Activate Mock Mode for APIs that require authentication
   * Validates: Requirement 6.4
   * 
   * @param apis - Array of API metadata
   * @returns Array of APIs with Mock Mode activated where needed
   */
  private activateMockMode(apis: APIMetadata[]): APIMetadata[] {
    return apis.map((api) => {
      // Activate Mock Mode for APIs requiring authentication
      if (api.authType === 'oauth' || api.authType === 'apikey') {
        return {
          ...api,
          mockData: api.mockData || {
            message: 'Mock data for ' + api.name,
            data: [],
            timestamp: Date.now(),
          },
        };
      }
      return api;
    });
  }



  /**
   * Generate a unique mashup ID
   * 
   * @returns Unique mashup identifier
   */
  private generateMashupId(): string {
    // Generate a simple unique ID using timestamp and random string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `mashup_${timestamp}_${randomStr}`;
  }

  /**
   * Create an error response with optional partial result
   * 
   * @param code - Error code
   * @param message - Error message
   * @param error - Original error object
   * @param partialResult - Partial mashup result if available
   * @returns ErrorResponse object
   */
  private createErrorResponse(
    code: string,
    message: string,
    error: any,
    partialResult?: Partial<MashupResponse>
  ): ErrorResponse {
    const errorDetails = error instanceof Error ? error.message : String(error);
    
    logger.logError(new Error(`${code}: ${message}`), {
      code,
      originalError: errorDetails,
      partialResult: partialResult ? {
        id: partialResult.id,
        hasIdea: !!partialResult.idea,
        hasUILayout: !!partialResult.uiLayout,
        hasCodePreview: !!partialResult.codePreview,
      } : undefined,
    });

    return {
      success: false,
      error: {
        code,
        message,
        details: errorDetails,
      },
      partialResult,
    };
  }

  /**
   * Clean up old ZIP files
   * 
   * @param maxAgeHours - Maximum age in hours
   */
  async cleanup(maxAgeHours: number = 24): Promise<void> {
    try {
      await this.zipExporter.cleanupOldFiles(maxAgeHours);
      logger.logInfo('Cleanup completed successfully', { maxAgeHours });
    } catch (error) {
      logger.logError(
        new PipelineError('Cleanup failed', 'CLEANUP', {
          maxAgeHours,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}
