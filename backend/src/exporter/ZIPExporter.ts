import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { GeneratedProject, AppIdea } from '../types/api.types';
import { ZIPCreationError, CleanupError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

/**
 * ZIPExporter class responsible for bundling generated files into a downloadable ZIP archive
 */
export class ZIPExporter {
  private tempDir: string;

  constructor(tempDir: string = '/tmp/mashup-maker') {
    this.tempDir = tempDir;
    // Ensure temp directory exists
    fs.ensureDirSync(this.tempDir);
  }

  /**
   * Create a ZIP archive from a generated project
   * @param project - The generated project containing backend and frontend code
   * @param idea - The app idea containing metadata
   * @returns Promise resolving to the path of the created ZIP file
   */
  async createArchive(project: GeneratedProject, idea: AppIdea): Promise<string> {
    try {
      const sanitizedName = this.sanitizeFilename(idea.appName);
      const filename = `${sanitizedName}.zip`;
      const filepath = path.join(this.tempDir, filename);

      logger.logInfo('Creating ZIP archive', { filename, appName: idea.appName });

      // Create write stream
      const output = fs.createWriteStream(filepath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          logger.logInfo('ZIP archive created successfully', {
            filename,
            size: archive.pointer(),
          });
          resolve(filepath);
        });

        output.on('error', (err) => {
          logger.logError(
            new ZIPCreationError('Failed to write ZIP file', {
              filename,
              originalError: err.message,
            })
          );
          reject(
            new ZIPCreationError('Failed to write ZIP file', {
              filename,
              originalError: err.message,
            })
          );
        });

        archive.on('error', (err) => {
          logger.logError(
            new ZIPCreationError('Failed to create ZIP archive', {
              filename,
              originalError: err.message,
            })
          );
          reject(
            new ZIPCreationError('Failed to create ZIP archive', {
              filename,
              originalError: err.message,
            })
          );
        });

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            logger.logWarning('ZIP archive warning', { code: err.code, message: err.message });
          } else {
            logger.logError(
              new ZIPCreationError('ZIP archive warning escalated to error', {
                code: err.code,
                originalError: err.message,
              })
            );
            reject(err);
          }
        });

        // Pipe archive data to the file
        archive.pipe(output);

        // Add backend files
        this.addFilesToArchive(archive, project.backend.files, 'backend');

        // Add frontend files
        this.addFilesToArchive(archive, project.frontend.files, 'frontend');

        // Generate and add README
        const readme = this.generateReadme(idea);
        archive.append(readme, { name: 'README.md' });

        // Finalize the archive
        archive.finalize();
      });
    } catch (error) {
      logger.logError(
        new ZIPCreationError('Failed to create ZIP archive', {
          appName: idea.appName,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      throw new ZIPCreationError('Failed to create ZIP archive', {
        appName: idea.appName,
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Add files to the archive with proper directory structure
   * @param archive - The archiver instance
   * @param files - Map of file paths to content
   * @param basePath - Base directory path (e.g., 'backend' or 'frontend')
   */
  private addFilesToArchive(
    archive: archiver.Archiver,
    files: Map<string, string>,
    basePath: string
  ): void {
    files.forEach((content, filepath) => {
      const fullPath = path.join(basePath, filepath);
      archive.append(content, { name: fullPath });
    });
  }

  /**
   * Generate a comprehensive README file
   * @param idea - The app idea
   * @returns README content as a string
   */
  private generateReadme(idea: AppIdea): string {
    const mockAPIs = idea.apis.filter(api => api.authType !== 'none');
    const hasMockMode = mockAPIs.length > 0;

    let readme = `# ${idea.appName}\n\n`;
    readme += `## Description\n\n${idea.description}\n\n`;
    
    readme += `## Features\n\n`;
    idea.features.forEach((feature, index) => {
      readme += `${index + 1}. ${feature}\n`;
    });
    readme += `\n`;

    readme += `## Rationale\n\n${idea.rationale}\n\n`;

    readme += `## Selected APIs\n\n`;
    idea.apis.forEach((api, index) => {
      readme += `### ${index + 1}. ${api.name}\n\n`;
      readme += `- **Description:** ${api.description}\n`;
      readme += `- **Category:** ${api.category}\n`;
      readme += `- **Base URL:** ${api.baseUrl}\n`;
      readme += `- **Sample Endpoint:** ${api.sampleEndpoint}\n`;
      readme += `- **Authentication:** ${api.authType}\n`;
      readme += `- **CORS Compatible:** ${api.corsCompatible ? 'Yes' : 'No'}\n`;
      readme += `- **Documentation:** ${api.documentationUrl}\n\n`;
    });

    readme += `## Setup Instructions\n\n`;
    readme += `### Backend Setup\n\n`;
    readme += `1. Navigate to the backend directory:\n`;
    readme += `   \`\`\`bash\n   cd backend\n   \`\`\`\n\n`;
    readme += `2. Install dependencies:\n`;
    readme += `   \`\`\`bash\n   npm install\n   \`\`\`\n\n`;
    readme += `3. Create a \`.env\` file based on \`.env.example\` and add your API keys\n\n`;
    readme += `4. Start the development server:\n`;
    readme += `   \`\`\`bash\n   npm run dev\n   \`\`\`\n\n`;

    readme += `### Frontend Setup\n\n`;
    readme += `1. Navigate to the frontend directory:\n`;
    readme += `   \`\`\`bash\n   cd frontend\n   \`\`\`\n\n`;
    readme += `2. Install dependencies:\n`;
    readme += `   \`\`\`bash\n   npm install\n   \`\`\`\n\n`;
    readme += `3. Create a \`.env\` file based on \`.env.example\`\n\n`;
    readme += `4. Start the development server:\n`;
    readme += `   \`\`\`bash\n   npm run dev\n   \`\`\`\n\n`;

    readme += `## API Integration Notes\n\n`;
    
    if (hasMockMode) {
      readme += `### Mock Mode Active\n\n`;
      readme += `Some APIs in this project require authentication (API keys or OAuth). `;
      readme += `The generated code includes mock data for these APIs to help you get started quickly.\n\n`;
      readme += `**APIs using mock data:**\n\n`;
      mockAPIs.forEach(api => {
        readme += `- **${api.name}** (${api.authType})\n`;
      });
      readme += `\n`;
      readme += `**To integrate real APIs:**\n\n`;
      readme += `1. Sign up for API keys at the respective API provider websites (see documentation links above)\n`;
      readme += `2. Add your API keys to the \`.env\` file in the backend directory\n`;
      readme += `3. Replace the mock data calls in the service files with real API calls\n`;
      readme += `4. Follow the inline comments marked with \`TODO\` for integration guidance\n\n`;
    } else {
      readme += `All selected APIs are publicly accessible without authentication. `;
      readme += `You can start making API calls immediately. Check the service files in the backend `;
      readme += `for integration examples and follow the inline comments for guidance.\n\n`;
    }

    readme += `## Next Steps\n\n`;
    readme += `1. Review the generated code structure in both backend and frontend directories\n`;
    readme += `2. Customize the UI components to match your design preferences\n`;
    readme += `3. Implement additional features and business logic\n`;
    readme += `4. Add error handling and validation\n`;
    readme += `5. Write tests for your custom functionality\n`;
    readme += `6. Deploy your application to your preferred hosting platform\n\n`;

    readme += `## Project Structure\n\n`;
    readme += `\`\`\`\n`;
    readme += `${idea.appName}/\n`;
    readme += `├── backend/          # Node.js/Express backend\n`;
    readme += `│   ├── src/\n`;
    readme += `│   │   ├── routes/   # API routes\n`;
    readme += `│   │   ├── services/ # API integration services\n`;
    readme += `│   │   └── utils/    # Utility functions\n`;
    readme += `│   └── package.json\n`;
    readme += `├── frontend/         # React frontend\n`;
    readme += `│   ├── src/\n`;
    readme += `│   │   ├── components/ # React components\n`;
    readme += `│   │   └── services/   # API service layer\n`;
    readme += `│   └── package.json\n`;
    readme += `└── README.md         # This file\n`;
    readme += `\`\`\`\n\n`;

    readme += `## Support\n\n`;
    readme += `This project was generated by Mashup Maker. For questions or issues:\n\n`;
    readme += `- Review the API documentation links provided above\n`;
    readme += `- Check the inline comments in the generated code\n`;
    readme += `- Refer to the official documentation for Node.js, Express, and React\n\n`;

    readme += `Happy coding! 🚀\n`;

    return readme;
  }

  /**
   * Sanitize app name to create a valid filename
   * @param appName - The app name to sanitize
   * @returns Sanitized filename
   */
  private sanitizeFilename(appName: string): string {
    return appName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  }

  /**
   * Clean up old ZIP files older than the specified age
   * @param maxAgeHours - Maximum age in hours (default: 24)
   */
  async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      logger.logInfo('Starting cleanup of old ZIP files', { maxAgeHours });

      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith('.zip')) {
          const filepath = path.join(this.tempDir, file);
          try {
            const stats = await fs.stat(filepath);
            const age = now - stats.mtimeMs;

            if (age > maxAgeMs) {
              await fs.remove(filepath);
              cleanedCount++;
              logger.logInfo('Cleaned up old ZIP file', { file, ageHours: age / (60 * 60 * 1000) });
            }
          } catch (fileError) {
            logger.logWarning('Failed to clean up file', {
              file,
              error: fileError instanceof Error ? fileError.message : String(fileError),
            });
          }
        }
      }

      logger.logInfo('Cleanup completed', { cleanedCount, totalFiles: files.length });
    } catch (error) {
      logger.logError(
        new CleanupError('Error during cleanup', {
          tempDir: this.tempDir,
          originalError: error instanceof Error ? error.message : String(error),
        })
      );
      // Don't throw - cleanup failures shouldn't break the application
    }
  }

  /**
   * Get the download URL for a ZIP file
   * @param filepath - Full path to the ZIP file
   * @returns Filename for URL construction
   */
  getFilename(filepath: string): string {
    return path.basename(filepath);
  }
}
