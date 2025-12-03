import { Router, Request, Response, NextFunction } from 'express';
import { AIChatbotService } from '../services/AIChatbotService';
import { logger } from '../utils/errorLogger';

const router = Router();
const chatbotService = new AIChatbotService();

/**
 * POST /api/chatbot/chat
 * Send a message to the AI assistant
 */
router.post(
  '/chat',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, conversationHistory, projectContext, errorContext } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MESSAGE',
            message: 'Message is required and must be a non-empty string',
          },
        });
        return;
      }

      logger.logInfo('Chatbot request received', {
        messageLength: message.length,
        hasHistory: !!conversationHistory,
        hasProjectContext: !!projectContext,
        hasErrorContext: !!errorContext,
      });

      const response = await chatbotService.chat({
        message,
        conversationHistory,
        projectContext,
        errorContext,
      });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.logError(error as Error, { context: 'Chatbot route error' });
      next(error);
    }
  }
);

/**
 * GET /api/chatbot/quick-help/:topic
 * Get quick help for common topics
 */
router.get(
  '/quick-help/:topic',
  (req: Request, res: Response): void => {
    try {
      const { topic } = req.params;
      const help = chatbotService.getQuickHelp(topic);

      res.status(200).json({
        success: true,
        data: {
          topic,
          help,
        },
      });
    } catch (error) {
      logger.logError(error as Error, { context: 'Quick help route error' });
      res.status(500).json({
        success: false,
        error: {
          code: 'QUICK_HELP_ERROR',
          message: 'Failed to retrieve quick help',
        },
      });
    }
  }
);

/**
 * GET /api/chatbot/status
 * Check if the AI service is configured
 */
router.get(
  '/status',
  (_req: Request, res: Response): void => {
    const isConfigured = chatbotService.isConfigured();

    res.status(200).json({
      success: true,
      data: {
        configured: isConfigured,
        message: isConfigured
          ? 'AI chatbot is ready'
          : 'AI chatbot requires configuration. Please add AI_API_KEY to .env file.',
      },
    });
  }
);

export default router;
