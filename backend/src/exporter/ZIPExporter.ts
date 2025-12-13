import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { GeneratedProject, AppIdea, APIMetadata } from '../types/api.types';
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
   * Generate a comprehensive README file focused on the combined idea
   * @param idea - The app idea
   * @returns README content as a string
   */
  private generateReadme(idea: AppIdea): string {
    const mockAPIs = idea.apis.filter(api => api.authType !== 'none');
    const hasMockMode = mockAPIs.length > 0;

    let readme = `# ${idea.appName}\n\n`;
    readme += `> 🤖 **AI-Generated App Concept** - Created by API Roulette\n\n`;
    readme += `## 💡 The Combined Idea\n\n`;
    readme += `${idea.description}\n\n`;
    readme += `This project demonstrates the power of **API mashups** - intelligently combining multiple APIs to create functionality that wouldn't be possible with any single API alone.\n\n`;
    
    readme += `## 🎯 Key Features\n\n`;
    idea.features.forEach((feature, index) => {
      readme += `${index + 1}. ${feature}\n`;
    });
    readme += `\n`;

    readme += `## 🧠 Why This Combination Works\n\n`;
    readme += `${idea.rationale}\n\n`;
    readme += `Each API contributes unique capabilities that, when combined, create a synergistic effect - the whole becomes greater than the sum of its parts.\n\n`;

    readme += `## 🔗 API Integration Strategy\n\n`;
    readme += `This project combines ${idea.apis.length} carefully selected APIs:\n\n`;
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
   * Generate an interactive HTML landing page focused on the combined idea
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
    <title>${idea.appName} - AI-Generated App Concept</title>
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
            max-width: 1000px;
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
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
        }
        
        .header .subtitle {
            font-size: 20px;
            opacity: 0.95;
            margin-bottom: 8px;
        }
        
        .header .description {
            font-size: 16px;
            opacity: 0.85;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .badge {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 20px;
        }
        
        .content {
            padding: 48px 40px;
        }
        
        .hero-section {
            text-align: center;
            margin-bottom: 60px;
            padding: 40px 20px;
            background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
            border-radius: 16px;
            border: 1px solid #E2E8F0;
        }
        
        .hero-section h2 {
            font-size: 28px;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 16px;
        }
        
        .hero-section .tagline {
            font-size: 18px;
            color: #475569;
            margin-bottom: 24px;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .concept-highlight {
            background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
            border: 2px solid #C7D2FE;
            border-radius: 12px;
            padding: 32px;
            margin: 32px 0;
        }
        
        .concept-highlight h3 {
            font-size: 24px;
            font-weight: 700;
            color: #3730A3;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .concept-highlight p {
            font-size: 18px;
            color: #4338CA;
            text-align: center;
            line-height: 1.7;
        }
        
        .section {
            margin-bottom: 48px;
        }
        
        .section h2 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #1E293B;
            letter-spacing: -0.01em;
        }
        
        .section p {
            color: #475569;
            margin-bottom: 16px;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .api-selection-story {
            background: #FEFCE8;
            border: 1px solid #FDE047;
            border-radius: 12px;
            padding: 32px;
            margin: 24px 0;
        }
        
        .api-selection-story h3 {
            font-size: 22px;
            font-weight: 700;
            color: #A16207;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .api-selection-story p {
            color: #92400E;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .api-combination {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin: 32px 0;
        }
        
        .api-role {
            background: white;
            border: 2px solid #E2E8F0;
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .api-role:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #7C3AED;
        }
        
        .api-role .role-number {
            position: absolute;
            top: -12px;
            left: 24px;
            background: #7C3AED;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
        }
        
        .api-role h4 {
            font-size: 20px;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 8px;
            margin-top: 8px;
        }
        
        .api-role .api-name {
            font-size: 16px;
            font-weight: 600;
            color: #7C3AED;
            margin-bottom: 12px;
        }
        
        .api-role p {
            color: #475569;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .api-role .contribution {
            background: #F8FAFC;
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
            border-left: 4px solid #7C3AED;
        }
        
        .api-role .contribution strong {
            color: #1E293B;
            display: block;
            margin-bottom: 8px;
        }
        
        .final-concept {
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
            border: 2px solid #86EFAC;
            border-radius: 16px;
            padding: 40px;
            margin: 40px 0;
            text-align: center;
        }
        
        .final-concept h3 {
            font-size: 26px;
            font-weight: 700;
            color: #14532D;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        .final-concept .concept-description {
            font-size: 18px;
            color: #166534;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto 24px;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }
        
        .feature-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #D1FAE5;
            text-align: left;
        }
        
        .feature-item strong {
            color: #14532D;
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .feature-item span {
            color: #166534;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .setup-preview {
            background: #F8FAFC;
            border-radius: 12px;
            padding: 32px;
            margin-top: 40px;
        }
        
        .setup-preview h3 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #1E293B;
            text-align: center;
        }
        
        .setup-preview p {
            text-align: center;
            color: #475569;
            margin-bottom: 24px;
        }
        
        .quick-start {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .start-card {
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 24px;
            text-align: center;
        }
        
        .start-card h4 {
            font-size: 18px;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 12px;
        }
        
        .start-card .step-list {
            text-align: left;
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .start-card .step-list li {
            margin-bottom: 8px;
        }
        
        code {
            background: #1E293B;
            color: #10B981;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
        }
        
        .alert {
            padding: 20px 24px;
            background: #FFF7ED;
            border: 1px solid #FDBA74;
            border-radius: 10px;
            margin: 24px 0;
        }
        
        .alert-title {
            font-weight: 700;
            color: #EA580C;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
        }
        
        .alert p {
            color: #9A3412;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .footer {
            text-align: center;
            padding: 40px;
            background: #F8FAFC;
            border-top: 1px solid #E7E5E4;
            color: #64748B;
            font-size: 15px;
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
            <h1>🎯 ${idea.appName}</h1>
            <div class="subtitle">AI-Generated App Concept</div>
            <div class="description">Intelligently combining ${idea.apis.length} APIs to create a unique application experience</div>
            <span class="badge">🤖 Generated by API Roulette</span>
        </div>
        
        <div class="content">
            <!-- Hero Section -->
            <div class="hero-section">
                <h2>🚀 What is API Roulette?</h2>
                <div class="tagline">
                    API Roulette is an AI-powered platform that randomly selects APIs from our curated registry 
                    and intelligently combines them into innovative app concepts. Each generated project demonstrates 
                    how different APIs can work together to create something greater than the sum of their parts.
                </div>
            </div>

            <!-- Main Concept -->
            <div class="concept-highlight">
                <h3>💡 The Combined Idea</h3>
                <p>${idea.description}</p>
            </div>

            <!-- API Selection Story -->
            <div class="section">
                <h2>🎲 Why These APIs Were Selected</h2>
                <div class="api-selection-story">
                    <h3>🧠 AI Selection Process</h3>
                    <p>
                        Our AI analyzed thousands of possible API combinations and selected these ${idea.apis.length} APIs 
                        because they create natural synergies. Each API contributes a unique capability that, when combined 
                        with the others, enables functionality that wouldn't be possible with any single API alone.
                    </p>
                </div>
                <p>${idea.rationale}</p>
            </div>

            <!-- How APIs Combine -->
            <div class="section">
                <h2>🔗 How These APIs Work Together</h2>
                <div class="api-combination">
                    ${idea.apis.map((api, index) => `
                    <div class="api-role">
                        <div class="role-number">${index + 1}</div>
                        <h4>Primary Role</h4>
                        <div class="api-name">${api.name}</div>
                        <p>${api.description}</p>
                        <div class="contribution">
                            <strong>Contribution to ${idea.appName}:</strong>
                            This API ${this.generateApiContribution(api, idea, index)}
                        </div>
                    </div>
                    `).join('\n                    ')}
                </div>
            </div>

            <!-- Final Combined Concept -->
            <div class="final-concept">
                <h3>✨ The Final Result</h3>
                <div class="concept-description">
                    By combining these ${idea.apis.length} APIs, <strong>${idea.appName}</strong> creates a unique user experience 
                    where ${this.generateCombinationExplanation(idea)}. This demonstrates the power of API mashups - 
                    taking existing services and combining them in creative ways to solve new problems.
                </div>
                
                <div class="features-grid">
                    ${idea.features.map(feature => `
                    <div class="feature-item">
                        <strong>🎯 Key Feature</strong>
                        <span>${feature}</span>
                    </div>
                    `).join('\n                    ')}
                </div>
            </div>

            ${hasMockMode ? `
            <div class="alert">
                <div class="alert-title">
                    <span>⚠️</span>
                    <span>Development Mode Notice</span>
                </div>
                <p>Some APIs require authentication keys. This project includes mock data for immediate testing. 
                To connect to real APIs, follow the setup instructions in the README.md and API_KEYS_GUIDE.md files.</p>
            </div>
            ` : ''}

            <!-- Setup Preview -->
            <div class="setup-preview">
                <h3>🛠️ Ready to Build?</h3>
                <p>This downloadable project includes everything you need to start developing immediately.</p>
                
                <div class="quick-start">
                    <div class="start-card">
                        <h4>📁 Project Structure</h4>
                        <div class="step-list">
                            <ul>
                                <li>Complete backend with API integrations</li>
                                <li>React frontend with modern UI components</li>
                                <li>Environment configuration templates</li>
                                <li>Comprehensive documentation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="start-card">
                        <h4>⚡ Quick Start</h4>
                        <div class="step-list">
                            <ul>
                                <li>Run <code>npm install</code> in both directories</li>
                                <li>Copy <code>.env.example</code> to <code>.env</code></li>
                                <li>Add your API keys (see API_KEYS_GUIDE.md)</li>
                                <li>Start with <code>npm run dev</code></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="start-card">
                        <h4>📚 Documentation</h4>
                        <div class="step-list">
                            <ul>
                                <li><strong>README.md</strong> - Complete setup guide</li>
                                <li><strong>API_KEYS_GUIDE.md</strong> - Authentication help</li>
                                <li>Inline code comments for guidance</li>
                                <li>API documentation links included</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Technical Details -->
            <div class="section">
                <h2>🔧 Technical Implementation</h2>
                <p>
                    This project demonstrates modern full-stack development practices with a Node.js/Express backend 
                    and React frontend. The APIs are integrated using industry-standard patterns, with proper error 
                    handling, environment configuration, and scalable architecture.
                </p>
                
                <div class="api-combination">
                    ${idea.apis.map(api => `
                    <div class="api-role">
                        <h4>${api.name}</h4>
                        <div class="api-name">${api.category}</div>
                        <p><strong>Base URL:</strong> ${api.baseUrl}</p>
                        <p><strong>Authentication:</strong> ${api.authType === 'none' ? 'Public API (no auth required)' : api.authType.toUpperCase()}</p>
                        <p><strong>CORS Support:</strong> ${api.corsCompatible ? '✅ Yes' : '❌ Requires proxy'}</p>
                        <div class="contribution">
                            <strong>Documentation:</strong>
                            <a href="${api.documentationUrl}" target="_blank" style="color: #7C3AED; text-decoration: none;">
                                View API Docs →
                            </a>
                        </div>
                    </div>
                    `).join('\n                    ')}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Powered by <a href="#" target="_blank">API Roulette</a> - Discover the unexpected potential of API combinations</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate a specific contribution explanation for an API in the context of the app idea
   * @param api - The API metadata
   * @param idea - The app idea
   * @param index - The API index
   * @returns Contribution explanation string
   */
  private generateApiContribution(api: APIMetadata, idea: AppIdea, index: number): string {
    const baseContributions = [
      `provides the core data foundation that ${idea.appName} builds upon, enabling ${this.extractMainFunction(idea.description)}`,
      `adds the interactive layer that allows users to ${this.extractUserAction(idea.description)}, making the app dynamic and engaging`,
      `delivers the essential functionality that ties everything together, ensuring ${idea.appName} can ${this.extractFinalOutcome(idea.description)}`
    ];
    
    // Customize based on API category if possible
    const categorySpecific = this.getCategorySpecificContribution(api.category, idea.appName);
    if (categorySpecific) {
      return categorySpecific;
    }
    
    // Use modulo to cycle through contributions if there are more than 3 APIs
    return baseContributions[index % baseContributions.length];
  }

  /**
   * Get category-specific contribution text
   * @param category - API category
   * @param appName - App name
   * @returns Category-specific contribution or null
   */
  private getCategorySpecificContribution(category: string, appName: string): string | null {
    const categoryMap: Record<string, string> = {
      'weather': `supplies real-time weather data that forms the environmental context for ${appName}`,
      'news': `delivers current news and information that keeps ${appName} users informed and engaged`,
      'location': `provides geolocation services that enable ${appName} to offer location-aware features`,
      'social': `connects social media data to make ${appName} more interactive and community-driven`,
      'finance': `integrates financial data to give ${appName} users valuable market insights`,
      'entertainment': `adds entertainment content that makes ${appName} more engaging and fun to use`
    };
    
    return categoryMap[category.toLowerCase()] || null;
  }

  /**
   * Generate an explanation of how all APIs combine together
   * @param idea - The app idea
   * @returns Combination explanation string
   */
  private generateCombinationExplanation(idea: AppIdea): string {
    const apiNames = idea.apis.map(api => api.name).join(', ');
    const mainConcept = this.extractMainConcept(idea.description);
    
    return `data from ${apiNames} flows seamlessly together to ${mainConcept}. Each API contributes its unique strengths, creating an integrated experience that showcases the innovative potential of modern API ecosystems`;
  }

  /**
   * Extract the main function from the app description
   * @param description - App description
   * @returns Main function string
   */
  private extractMainFunction(description: string): string {
    // Look for action words and extract the main purpose
    const actionWords = ['combines', 'integrates', 'connects', 'merges', 'blends', 'unifies'];
    const lowerDesc = description.toLowerCase();
    
    for (const word of actionWords) {
      if (lowerDesc.includes(word)) {
        const parts = description.split(new RegExp(word, 'i'));
        if (parts.length > 1) {
          return parts[1].trim().split('.')[0].toLowerCase();
        }
      }
    }
    
    // Fallback: extract first sentence and make it generic
    const firstSentence = description.split('.')[0];
    return `deliver ${firstSentence.toLowerCase().replace(/^[^a-z]*/, '')}`;
  }

  /**
   * Extract user action from the app description
   * @param description - App description
   * @returns User action string
   */
  private extractUserAction(description: string): string {
    // Look for user-focused verbs
    const userActions = ['explore', 'discover', 'find', 'search', 'browse', 'access', 'view', 'interact'];
    const lowerDesc = description.toLowerCase();
    
    for (const action of userActions) {
      if (lowerDesc.includes(action)) {
        return `${action} and interact with the combined data`;
      }
    }
    
    return 'engage with the integrated features';
  }

  /**
   * Extract final outcome from the app description
   * @param description - App description
   * @returns Final outcome string
   */
  private extractFinalOutcome(description: string): string {
    // Look for outcome-focused phrases
    const outcomes = ['provide', 'deliver', 'offer', 'create', 'generate', 'produce'];
    const lowerDesc = description.toLowerCase();
    
    for (const outcome of outcomes) {
      if (lowerDesc.includes(outcome)) {
        const parts = description.split(new RegExp(outcome, 'i'));
        if (parts.length > 1) {
          return `${outcome} ${parts[1].trim().split('.')[0].toLowerCase()}`;
        }
      }
    }
    
    return 'achieve its core objectives';
  }

  /**
   * Extract main concept from the app description
   * @param description - App description
   * @returns Main concept string
   */
  private extractMainConcept(description: string): string {
    // Extract the core concept by finding the main verb and object
    const sentences = description.split('.');
    const firstSentence = sentences[0].toLowerCase();
    
    // Look for patterns like "app that [does something]"
    if (firstSentence.includes('that ')) {
      const concept = firstSentence.split('that ')[1];
      return concept.trim();
    }
    
    // Look for patterns with action verbs
    const actionVerbs = ['combines', 'integrates', 'connects', 'merges', 'creates', 'provides'];
    for (const verb of actionVerbs) {
      if (firstSentence.includes(verb)) {
        const parts = firstSentence.split(verb);
        if (parts.length > 1) {
          return `${verb} ${parts[1].trim()}`;
        }
      }
    }
    
    // Fallback
    return 'create a unique and valuable user experience';
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
