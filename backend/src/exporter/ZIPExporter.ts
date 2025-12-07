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

  constructor(tempDir: string = '/tmp/api-roulette') {
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

        // Generate and add index.html landing page
        const indexHtml = this.generateIndexHtml(idea);
        archive.append(indexHtml, { name: 'index.html' });

        // Generate and add API Keys Guide
        const apiKeysGuide = this.generateApiKeysGuide(idea);
        archive.append(apiKeysGuide, { name: 'API_KEYS_GUIDE.md' });

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

    readme += `## API Integration & Authentication\n\n`;
    
    readme += `### Getting Your API Keys\n\n`;
    readme += `This project uses the following APIs. Here's how to get your API keys:\n\n`;
    
    idea.apis.forEach((api, index) => {
      readme += `#### ${index + 1}. ${api.name}\n\n`;
      readme += `**Authentication Type:** ${api.authType === 'none' ? 'No authentication required' : api.authType.toUpperCase()}\n\n`;
      
      if (api.authType !== 'none') {
        readme += `**How to get your API key:**\n\n`;
        readme += `1. Visit the official website: [${api.name} Documentation](${api.documentationUrl})\n`;
        readme += `2. Sign up for a free account (or log in if you already have one)\n`;
        readme += `3. Navigate to the API section or Developer Dashboard\n`;
        readme += `4. Generate a new API key\n`;
        readme += `5. Copy the API key and add it to your \`.env\` file:\n`;
        readme += `   \`\`\`\n`;
        readme += `   ${this.generateEnvVarName(api.name)}=your_api_key_here\n`;
        readme += `   \`\`\`\n\n`;
        readme += `**Important Notes:**\n`;
        readme += `- Keep your API keys secure and never commit them to version control\n`;
        readme += `- Check the API's rate limits and pricing on their documentation page\n`;
        readme += `- Some APIs may require email verification before issuing keys\n\n`;
      } else {
        readme += `**Good news!** This API doesn't require authentication. You can start using it immediately.\n\n`;
      }
      
      readme += `**API Documentation:** ${api.documentationUrl}\n`;
      readme += `**Base URL:** ${api.baseUrl}\n`;
      readme += `**Sample Endpoint:** ${api.sampleEndpoint}\n\n`;
      readme += `---\n\n`;
    });
    
    if (hasMockMode) {
      readme += `### Mock Mode\n\n`;
      readme += `Some APIs in this project require authentication. The generated code includes mock data `;
      readme += `for these APIs so you can test the application immediately without API keys.\n\n`;
      readme += `**APIs using mock data:**\n\n`;
      mockAPIs.forEach(api => {
        readme += `- **${api.name}** (${api.authType})\n`;
      });
      readme += `\n`;
      readme += `**To switch from mock data to real APIs:**\n\n`;
      readme += `1. Follow the instructions above to get your API keys\n`;
      readme += `2. Add your API keys to the \`.env\` file in the backend directory\n`;
      readme += `3. Open the service files in \`backend/src/services/\`\n`;
      readme += `4. Uncomment the real API call code (marked with \`TODO\`)\n`;
      readme += `5. Comment out or remove the mock data return statements\n`;
      readme += `6. Restart your backend server\n\n`;
    } else {
      readme += `### No Authentication Required\n\n`;
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
    readme += `This project was generated by API Roulette. For questions or issues:\n\n`;
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
   * Generate environment variable name from API name
   * @param apiName - The API name
   * @returns Environment variable name
   */
  private generateEnvVarName(apiName: string): string {
    return apiName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_') // Replace non-alphanumeric with underscores
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      + '_API_KEY';
  }

  /**
   * Generate comprehensive API Keys Guide
   * @param idea - The app idea
   * @returns API Keys Guide content as a string
   */
  private generateApiKeysGuide(idea: AppIdea): string {
    let guide = `# 🔑 API Keys Setup Guide\n\n`;
    guide += `This guide will help you obtain API keys for all the APIs used in **${idea.appName}**.\n\n`;
    guide += `## Table of Contents\n\n`;
    
    idea.apis.forEach((api, index) => {
      guide += `${index + 1}. [${api.name}](#${index + 1}-${this.sanitizeFilename(api.name)})\n`;
    });
    
    guide += `\n---\n\n`;

    idea.apis.forEach((api, index) => {
      guide += `## ${index + 1}. ${api.name}\n\n`;
      guide += `**Category:** ${api.category}\n\n`;
      guide += `**Authentication Type:** ${api.authType === 'none' ? 'No authentication required ✅' : api.authType.toUpperCase()}\n\n`;
      
      if (api.authType === 'none') {
        guide += `### ✅ No Setup Required\n\n`;
        guide += `This API is publicly accessible and doesn't require an API key. You can start using it immediately!\n\n`;
        guide += `**Base URL:** \`${api.baseUrl}\`\n\n`;
        guide += `**Sample Endpoint:** \`${api.sampleEndpoint}\`\n\n`;
        guide += `**Documentation:** [${api.documentationUrl}](${api.documentationUrl})\n\n`;
      } else {
        guide += `### 📋 Step-by-Step Instructions\n\n`;
        
        if (api.authType === 'apikey') {
          guide += `#### Step 1: Visit the API Provider\n\n`;
          guide += `Go to the official website: [${api.name} Documentation](${api.documentationUrl})\n\n`;
          
          guide += `#### Step 2: Create an Account\n\n`;
          guide += `- Click on "Sign Up" or "Get Started"\n`;
          guide += `- Fill in your details (email, password, etc.)\n`;
          guide += `- Verify your email address if required\n`;
          guide += `- Some APIs may require additional information like:\n`;
          guide += `  - Company name\n`;
          guide += `  - Use case description\n`;
          guide += `  - Phone number verification\n\n`;
          
          guide += `#### Step 3: Navigate to API Keys Section\n\n`;
          guide += `Look for one of these sections in your dashboard:\n`;
          guide += `- "API Keys"\n`;
          guide += `- "Developer Settings"\n`;
          guide += `- "Credentials"\n`;
          guide += `- "Applications"\n`;
          guide += `- "Access Tokens"\n\n`;
          
          guide += `#### Step 4: Generate Your API Key\n\n`;
          guide += `- Click "Create New API Key" or "Generate Key"\n`;
          guide += `- Give your key a descriptive name (e.g., "${idea.appName} Development")\n`;
          guide += `- Copy the API key immediately (some APIs only show it once!)\n`;
          guide += `- Store it securely\n\n`;
          
          guide += `#### Step 5: Add to Your Project\n\n`;
          guide += `Open the \`backend/.env\` file and add:\n\n`;
          guide += `\`\`\`bash\n`;
          guide += `${this.generateEnvVarName(api.name)}=your_api_key_here\n`;
          guide += `\`\`\`\n\n`;
          
        } else if (api.authType === 'oauth') {
          guide += `#### Step 1: Visit the API Provider\n\n`;
          guide += `Go to: [${api.name} Documentation](${api.documentationUrl})\n\n`;
          
          guide += `#### Step 2: Create a Developer Account\n\n`;
          guide += `- Sign up for a developer account\n`;
          guide += `- Complete any required verification steps\n\n`;
          
          guide += `#### Step 3: Create an Application\n\n`;
          guide += `- Navigate to "My Apps" or "Applications"\n`;
          guide += `- Click "Create New App" or "Register Application"\n`;
          guide += `- Fill in the required details:\n`;
          guide += `  - App Name: "${idea.appName}"\n`;
          guide += `  - Description: "${idea.description}"\n`;
          guide += `  - Redirect URI: \`http://localhost:3000/auth/callback\` (for development)\n\n`;
          
          guide += `#### Step 4: Get Your Credentials\n\n`;
          guide += `After creating the app, you'll receive:\n`;
          guide += `- Client ID\n`;
          guide += `- Client Secret\n`;
          guide += `- Sometimes an API Key as well\n\n`;
          
          guide += `Copy these credentials immediately!\n\n`;
          
          guide += `#### Step 5: Add to Your Project\n\n`;
          guide += `Open the \`backend/.env\` file and add:\n\n`;
          guide += `\`\`\`bash\n`;
          guide += `${this.generateEnvVarName(api.name)}_CLIENT_ID=your_client_id_here\n`;
          guide += `${this.generateEnvVarName(api.name)}_CLIENT_SECRET=your_client_secret_here\n`;
          guide += `\`\`\`\n\n`;
        }
        
        guide += `### 📚 Additional Resources\n\n`;
        guide += `- **Official Documentation:** [${api.documentationUrl}](${api.documentationUrl})\n`;
        guide += `- **Base URL:** \`${api.baseUrl}\`\n`;
        guide += `- **Sample Endpoint:** \`${api.sampleEndpoint}\`\n\n`;
        
        guide += `### ⚠️ Important Notes\n\n`;
        guide += `- **Never commit your API keys to version control** (they're in .gitignore)\n`;
        guide += `- **Check rate limits** - Most free tiers have usage limits\n`;
        guide += `- **Read the pricing page** - Understand costs before going to production\n`;
        guide += `- **Enable billing alerts** - Set up notifications if the API charges fees\n`;
        guide += `- **Rotate keys regularly** - For security, change your keys periodically\n\n`;
        
        guide += `### 🔧 Testing Your API Key\n\n`;
        guide += `After adding your key to the \`.env\` file:\n\n`;
        guide += `1. Restart your backend server:\n`;
        guide += `   \`\`\`bash\n`;
        guide += `   cd backend\n`;
        guide += `   npm run dev\n`;
        guide += `   \`\`\`\n\n`;
        guide += `2. Check the console for any authentication errors\n`;
        guide += `3. Test the API endpoint in your browser or with a tool like Postman\n`;
        guide += `4. If you see errors, double-check:\n`;
        guide += `   - The API key is correct (no extra spaces)\n`;
        guide += `   - The environment variable name matches\n`;
        guide += `   - You've restarted the server after adding the key\n\n`;
      }
      
      guide += `---\n\n`;
    });

    guide += `## 🚀 Quick Start Checklist\n\n`;
    guide += `Use this checklist to track your progress:\n\n`;
    
    idea.apis.forEach((api) => {
      if (api.authType !== 'none') {
        guide += `- [ ] ${api.name} - Get API key from [${api.documentationUrl}](${api.documentationUrl})\n`;
      } else {
        guide += `- [x] ${api.name} - No API key needed ✅\n`;
      }
    });
    
    guide += `- [ ] Add all API keys to \`backend/.env\`\n`;
    guide += `- [ ] Restart backend server\n`;
    guide += `- [ ] Test all API endpoints\n`;
    guide += `- [ ] Update service files to use real API calls (remove mock data)\n\n`;

    guide += `## 💡 Pro Tips\n\n`;
    guide += `1. **Use separate keys for development and production**\n`;
    guide += `   - Create different API keys for different environments\n`;
    guide += `   - This makes it easier to track usage and revoke keys if needed\n\n`;
    
    guide += `2. **Set up environment-specific .env files**\n`;
    guide += `   - \`.env.development\` for local development\n`;
    guide += `   - \`.env.production\` for production deployment\n\n`;
    
    guide += `3. **Monitor your API usage**\n`;
    guide += `   - Most API providers have dashboards showing your usage\n`;
    guide += `   - Set up alerts before hitting rate limits\n\n`;
    
    guide += `4. **Read the API documentation thoroughly**\n`;
    guide += `   - Understand authentication requirements\n`;
    guide += `   - Learn about rate limits and quotas\n`;
    guide += `   - Check for any special headers or parameters needed\n\n`;
    
    guide += `5. **Test with small requests first**\n`;
    guide += `   - Start with simple API calls to verify everything works\n`;
    guide += `   - Gradually increase complexity as you confirm functionality\n\n`;

    guide += `## 🆘 Troubleshooting\n\n`;
    guide += `### "Invalid API Key" Error\n\n`;
    guide += `- Double-check the key is copied correctly (no extra spaces)\n`;
    guide += `- Verify the environment variable name matches what's in the code\n`;
    guide += `- Make sure you've restarted the server after adding the key\n`;
    guide += `- Check if the API key has been activated (some require email confirmation)\n\n`;
    
    guide += `### "Rate Limit Exceeded" Error\n\n`;
    guide += `- You've hit the API's usage limit\n`;
    guide += `- Wait for the limit to reset (usually hourly or daily)\n`;
    guide += `- Consider upgrading to a paid tier if needed\n`;
    guide += `- Implement caching to reduce API calls\n\n`;
    
    guide += `### "Unauthorized" or "Forbidden" Error\n\n`;
    guide += `- Check if your API key has the necessary permissions\n`;
    guide += `- Some APIs require you to enable specific features\n`;
    guide += `- Verify your account is in good standing\n`;
    guide += `- Check if you need to accept terms of service\n\n`;

    guide += `## 📞 Need Help?\n\n`;
    guide += `If you're stuck:\n\n`;
    guide += `1. Check the API's official documentation (links provided above)\n`;
    guide += `2. Look for the API's community forum or Discord\n`;
    guide += `3. Search for "[API Name] authentication tutorial" on YouTube\n`;
    guide += `4. Check Stack Overflow for common issues\n`;
    guide += `5. Review the generated code comments for integration hints\n\n`;

    guide += `---\n\n`;
    guide += `**Generated by API Roulette** | Happy coding! 🎉\n`;

    return guide;
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
   * Generate an interactive HTML landing page
   * @param idea - The app idea
   * @returns HTML content as a string
   */
  private generateIndexHtml(idea: AppIdea): string {
    const mockAPIs = idea.apis.filter(api => api.authType !== 'none');
    const hasMockMode = mockAPIs.length > 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${idea.appName} - Project Overview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            line-height: 1.6;
            color: #1C1917;
            background: linear-gradient(135deg, #FAFAF9 0%, #F5F5F4 100%);
            padding: 40px 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
            color: white;
            padding: 48px 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.95;
        }
        
        .badge {
            display: inline-block;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 16px;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1C1917;
            letter-spacing: -0.01em;
        }
        
        .section p {
            color: #57534E;
            margin-bottom: 12px;
        }
        
        .features {
            list-style: none;
            display: grid;
            gap: 12px;
        }
        
        .features li {
            padding: 12px 16px;
            background: #FAFAF9;
            border-radius: 8px;
            border-left: 3px solid #7C3AED;
            color: #1C1917;
        }
        
        .api-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin-top: 20px;
        }
        
        .api-card {
            padding: 20px;
            background: #FAFAF9;
            border: 1px solid #E7E5E4;
            border-radius: 12px;
            transition: all 0.2s;
        }
        
        .api-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .api-card h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1C1917;
        }
        
        .api-card p {
            font-size: 14px;
            color: #78716C;
            margin-bottom: 12px;
        }
        
        .api-meta {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .tag {
            padding: 4px 10px;
            background: white;
            border: 1px solid #E7E5E4;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            color: #57534E;
        }
        
        .setup-steps {
            background: #F5F5F4;
            border-radius: 12px;
            padding: 24px;
            margin-top: 20px;
        }
        
        .setup-steps h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1C1917;
        }
        
        .step {
            margin-bottom: 20px;
        }
        
        .step-number {
            display: inline-block;
            width: 28px;
            height: 28px;
            background: #7C3AED;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: 600;
            font-size: 14px;
            margin-right: 12px;
        }
        
        .step-content {
            display: inline-block;
            vertical-align: top;
            width: calc(100% - 40px);
        }
        
        .step-title {
            font-weight: 600;
            color: #1C1917;
            margin-bottom: 4px;
        }
        
        code {
            background: #1C1917;
            color: #14B8A6;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
        }
        
        .code-block {
            background: #1C1917;
            color: #F5F5F4;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 12px 0;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
        }
        
        .alert {
            padding: 16px 20px;
            background: #FFF7ED;
            border: 1px solid #FDBA74;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .alert-title {
            font-weight: 600;
            color: #EA580C;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .alert p {
            color: #9A3412;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            padding: 32px;
            background: #FAFAF9;
            border-top: 1px solid #E7E5E4;
            color: #78716C;
            font-size: 14px;
        }
        
        .footer a {
            color: #7C3AED;
            text-decoration: none;
            font-weight: 600;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ ${idea.appName}</h1>
            <p>${idea.description}</p>
            <span class="badge">Generated by API Roulette</span>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>🎯 Features</h2>
                <ul class="features">
                    ${idea.features.map(feature => `<li>${feature}</li>`).join('\n                    ')}
                </ul>
            </div>
            
            <div class="section">
                <h2>💡 Rationale</h2>
                <p>${idea.rationale}</p>
            </div>
            
            <div class="section">
                <h2>🔌 Selected APIs</h2>
                <div class="api-grid">
                    ${idea.apis.map(api => `
                    <div class="api-card">
                        <h3>${api.name}</h3>
                        <p>${api.description}</p>
                        <div class="api-meta">
                            <span class="tag">${api.category}</span>
                            <span class="tag">${api.authType === 'none' ? 'No Auth' : api.authType.toUpperCase()}</span>
                            ${api.corsCompatible ? '<span class="tag">CORS ✓</span>' : ''}
                        </div>
                    </div>
                    `).join('\n                    ')}
                </div>
            </div>
            
            ${hasMockMode ? `
            <div class="alert">
                <div class="alert-title">
                    <span>⚠️</span>
                    <span>Mock Mode Active</span>
                </div>
                <p>Some APIs require authentication. The generated code includes mock data for these APIs. To use real data, add your API keys to the backend/.env file and update the service files.</p>
            </div>
            ` : ''}
            
            <div class="section">
                <h2>🚀 Quick Start</h2>
                <div class="setup-steps">
                    <h3>Backend Setup</h3>
                    <div class="step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <div class="step-title">Navigate to backend directory</div>
                            <div class="code-block">cd backend</div>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <div class="step-title">Install dependencies</div>
                            <div class="code-block">npm install</div>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <div class="step-title">Configure environment</div>
                            <p>Copy <code>.env.example</code> to <code>.env</code> and add your API keys</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">4</span>
                        <div class="step-content">
                            <div class="step-title">Start the server</div>
                            <div class="code-block">npm run dev</div>
                        </div>
                    </div>
                </div>
                
                <div class="setup-steps" style="margin-top: 20px;">
                    <h3>Frontend Setup</h3>
                    <div class="step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <div class="step-title">Navigate to frontend directory</div>
                            <div class="code-block">cd frontend</div>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <div class="step-title">Install dependencies</div>
                            <div class="code-block">npm install</div>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <div class="step-title">Configure environment</div>
                            <p>Copy <code>.env.example</code> to <code>.env</code></p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">4</span>
                        <div class="step-content">
                            <div class="step-title">Start the development server</div>
                            <div class="code-block">npm run dev</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>📚 Documentation</h2>
                <p>For detailed information about the project structure, API integration, and deployment:</p>
                <ul class="features">
                    <li>Read the <strong>README.md</strong> file for comprehensive documentation</li>
                    <li>Check the <strong>backend/src/services/</strong> directory for API integration examples</li>
                    <li>Review the <strong>frontend/src/components/</strong> directory for UI components</li>
                    <li>Visit the API documentation links above for authentication details</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Created with <a href="https://github.com/yourusername/api-roulette" target="_blank">API Roulette</a></p>
        </div>
    </div>
</body>
</html>`;
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
