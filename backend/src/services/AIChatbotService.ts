import axios from 'axios';
import { getEnvConfig } from '../utils/validateEnv';
import { logger } from '../utils/errorLogger';
import { MashupResponse } from '../types/api.types';

/**
 * Message in a chat conversation
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Chat request from the frontend
 */
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  projectContext?: MashupResponse;
  errorContext?: {
    errorMessage: string;
    stackTrace?: string;
    fileName?: string;
    lineNumber?: number;
  };
}

/**
 * Chat response to the frontend
 */
export interface ChatResponse {
  message: string;
  conversationHistory: ChatMessage[];
}

/**
 * AI Chatbot Service for helping users with their downloaded projects
 * This service provides context-aware assistance for generated mashup projects
 */
export class AIChatbotService {
  private apiKey: string | undefined;
  private model: string;
  private apiUrl: string;

  constructor() {
    const config = getEnvConfig();
    this.apiKey = config.AI_API_KEY;
    this.model = config.AI_MODEL || 'gpt-4';
    this.apiUrl = config.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Check if the AI service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_api_key_here';
  }

  /**
   * Generate a system prompt based on project context
   */
  private generateSystemPrompt(projectContext?: MashupResponse): string {
    let systemPrompt = `You are an expert AI assistant specialized in helping developers with Mashup Maker projects. 

Your expertise includes:
- Full-stack development (Node.js/Express backend, React frontend)
- API integration and authentication (OAuth, API keys)
- Error debugging and troubleshooting
- Code explanation and best practices
- Project structure and architecture
- Environment configuration
- npm/package management
- TypeScript and JavaScript

Your role is to:
1. Provide clear, precise, and actionable solutions
2. Explain code concepts in an easy-to-understand way
3. Debug errors with specific fixes
4. Suggest improvements and best practices
5. Help with API integration challenges
6. Guide users through setup and configuration

Always:
- Be concise but thorough
- Provide code examples when relevant
- Reference specific files and line numbers when debugging
- Explain WHY something works, not just HOW
- Consider the full-stack context of the project
`;

    if (projectContext) {
      systemPrompt += `\n\nCURRENT PROJECT CONTEXT:
App Name: ${projectContext.idea.appName}
Description: ${projectContext.idea.description}

APIs Used:
${projectContext.idea.apis.map((api, idx) => 
  `${idx + 1}. ${api.name} (${api.category})
   - Auth Type: ${api.authType}
   - Base URL: ${api.baseUrl}
   - Sample Endpoint: ${api.sampleEndpoint}
   - CORS Compatible: ${api.corsCompatible ? 'Yes' : 'No'}
   ${api.mockData ? '   - Using Mock Data: Yes' : ''}`
).join('\n')}

Features:
${projectContext.idea.features.map((f, idx) => `${idx + 1}. ${f}`).join('\n')}

Project Structure:
- Backend: Node.js/Express with TypeScript
  - Routes in backend/src/routes/
  - Services in backend/src/services/
  - API integration logic
- Frontend: React with TypeScript
  - Components in frontend/src/components/
  - Services in frontend/src/services/
  - State management with Context API

The project follows a standard full-stack architecture with clear separation of concerns.`;
    }

    return systemPrompt;
  }

  /**
   * Generate an error-specific prompt
   */
  private generateErrorPrompt(errorContext: ChatRequest['errorContext']): string {
    if (!errorContext) return '';

    let errorPrompt = `\n\nERROR CONTEXT:
Error Message: ${errorContext.errorMessage}`;

    if (errorContext.fileName) {
      errorPrompt += `\nFile: ${errorContext.fileName}`;
    }

    if (errorContext.lineNumber) {
      errorPrompt += `\nLine: ${errorContext.lineNumber}`;
    }

    if (errorContext.stackTrace) {
      errorPrompt += `\nStack Trace:\n${errorContext.stackTrace}`;
    }

    errorPrompt += `\n\nPlease analyze this error and provide:
1. Root cause explanation
2. Specific fix with code examples
3. Why this error occurred
4. How to prevent it in the future`;

    return errorPrompt;
  }

  /**
   * Chat with the AI assistant
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('AI service is not configured. Please add your AI_API_KEY to the .env file.');
    }

    try {
      // Build conversation history
      const messages: ChatMessage[] = [];

      // Add system prompt
      const systemPrompt = this.generateSystemPrompt(request.projectContext);
      messages.push({
        role: 'system',
        content: systemPrompt,
      });

      // Add conversation history if provided
      if (request.conversationHistory && request.conversationHistory.length > 0) {
        // Skip the old system message if present
        const historyWithoutSystem = request.conversationHistory.filter(
          msg => msg.role !== 'system'
        );
        messages.push(...historyWithoutSystem);
      }

      // Add current user message with error context if provided
      let userMessage = request.message;
      if (request.errorContext) {
        userMessage += this.generateErrorPrompt(request.errorContext);
      }

      messages.push({
        role: 'user',
        content: userMessage,
      });

      logger.logInfo('Sending chat request to AI service', {
        model: this.model,
        messageCount: messages.length,
        hasProjectContext: !!request.projectContext,
        hasErrorContext: !!request.errorContext,
      });

      // Call AI API
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      // Build updated conversation history
      const updatedHistory: ChatMessage[] = [
        ...messages.filter(msg => msg.role !== 'system'),
        {
          role: 'assistant',
          content: assistantMessage,
        },
      ];

      logger.logInfo('AI chat response received', {
        responseLength: assistantMessage.length,
        tokensUsed: response.data.usage?.total_tokens,
      });

      return {
        message: assistantMessage,
        conversationHistory: updatedHistory,
      };
    } catch (error) {
      logger.logError(error as Error, {
        context: 'AI chat request failed',
        hasProjectContext: !!request.projectContext,
      });

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid AI API key. Please check your AI_API_KEY in the .env file.');
        }
        if (error.response?.status === 429) {
          throw new Error('AI API rate limit exceeded. Please try again later.');
        }
        throw new Error(`AI API error: ${error.response?.data?.error?.message || error.message}`);
      }

      throw new Error('Failed to communicate with AI service. Please try again.');
    }
  }

  /**
   * Get a quick help response for common questions
   */
  getQuickHelp(topic: string): string {
    const quickHelps: Record<string, string> = {
      setup: `To set up your downloaded project:

1. Extract the ZIP file
2. Navigate to the backend directory:
   cd backend
   npm install
   
3. Configure environment variables:
   - Copy .env.example to .env
   - Add your API keys for the APIs that require authentication
   
4. Start the backend:
   npm run dev
   
5. In a new terminal, navigate to frontend:
   cd frontend
   npm install
   
6. Configure frontend environment:
   - Copy .env.example to .env
   - Set VITE_API_BASE_URL (usually http://localhost:3000/api)
   
7. Start the frontend:
   npm run dev

Your app should now be running!`,

      'api-keys': `To add API keys to your project:

1. Open backend/.env file
2. Add your API keys following this format:
   API_NAME_KEY=your_actual_key_here
   
3. The generated code includes comments showing where to add keys
4. For OAuth APIs, you'll need to implement the OAuth flow
5. APIs with mock data will work immediately but with sample data

Check each API's documentation link in the README for how to obtain keys.`,

      errors: `Common errors and solutions:

1. "Cannot find module" - Run npm install in the directory
2. "Port already in use" - Change PORT in .env or stop other services
3. "API key invalid" - Check your .env file has correct keys
4. "CORS error" - Ensure backend is running and VITE_API_BASE_URL is correct
5. "Module not found" - Check import paths and file names

For specific errors, share the error message with me for detailed help!`,

      structure: `Project structure:

backend/
├── src/
│   ├── routes/      # API endpoints
│   ├── services/    # API integration logic
│   ├── utils/       # Helper functions
│   └── server.ts    # Express server setup
├── .env             # Environment variables
└── package.json

frontend/
├── src/
│   ├── components/  # React components
│   ├── services/    # API calls to backend
│   ├── App.tsx      # Main app component
│   └── main.tsx     # Entry point
├── .env             # Frontend config
└── package.json

Both use TypeScript for type safety.`,
    };

    return quickHelps[topic] || 'Topic not found. Ask me anything about your project!';
  }
}
