import { Router, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs-extra';
import { MashupPipeline } from '../pipeline/MashupPipeline';
import { validateRequest } from '../middleware/validator';
import { generateMashupSchema } from '../validation/schemas';
import { InvalidFilenameError, FileNotFoundError } from '../errors/CustomErrors';
import { logger } from '../utils/errorLogger';

const router = Router();

// Get temp directory from environment or use default
// Resolve relative paths from the backend directory (parent of dist)
const getTempDir = (): string => {
  const envTempDir = process.env.TEMP_DIR || 'temp';
  return path.isAbsolute(envTempDir) 
    ? envTempDir 
    : path.join(__dirname, '../../', envTempDir);
};

const tempDir = getTempDir();

// Initialize pipeline with temp directory
const pipeline = new MashupPipeline(undefined, tempDir);

/**
 * POST /api/mashup/generate
 * Generate a new mashup with three random APIs
 * Validates: Requirements 5.5
 */
router.post(
  '/generate',
  validateRequest(generateMashupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { options } = req.body;

      logger.logInfo('Mashup generation requested', { options, ip: req.ip });

      // Generate mashup using pipeline
      const result = await pipeline.generateMashup(options);

      // Check if result is an error
      if ('success' in result && result.success === false) {
        const statusCode = result.error.code === 'INSUFFICIENT_APIS' || 
                          result.error.code === 'INSUFFICIENT_CATEGORIES' ? 400 : 500;
        res.status(statusCode).json(result);
        return;
      }

      // Return success response
      logger.logInfo('Mashup generation successful', { 
        mashupId: 'id' in result ? result.id : 'unknown',
        appName: 'idea' in result ? result.idea.appName : 'unknown',
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/mashup/generate-custom
 * Generate a mashup with user-selected APIs
 */
router.post(
  '/generate-custom',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { apiIds } = req.body;

      if (!apiIds || !Array.isArray(apiIds) || apiIds.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'apiIds must be a non-empty array',
          },
        });
        return;
      }

      logger.logInfo('Custom mashup generation requested', { apiIds, ip: req.ip });

      // Generate mashup with specific APIs
      const result = await pipeline.generateCustomMashup(apiIds);

      // Check if result is an error
      if ('success' in result && result.success === false) {
        res.status(400).json(result);
        return;
      }

      // Return success response
      logger.logInfo('Custom mashup generation successful', { 
        mashupId: 'id' in result ? result.id : 'unknown',
        appName: 'idea' in result ? result.idea.appName : 'unknown',
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/mashup/download/:filename
 * Download the ZIP archive for a generated mashup
 * Validates: Requirements 3.1
 */
router.get(
  '/download/:filename',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;

      logger.logInfo('Download requested', { filename, ip: req.ip });

      // Validate filename to prevent path traversal
      if (!filename || filename.includes('..') || filename.includes('/') || !filename.endsWith('.zip')) {
        logger.logWarning('Invalid filename in download request', { filename, ip: req.ip });
        throw new InvalidFilenameError(filename);
      }

      // Construct file path using the same temp directory as the pipeline
      const filePath = path.join(tempDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        logger.logWarning('File not found for download', { filename, filePath });
        throw new FileNotFoundError(filename);
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Handle stream errors
      fileStream.on('error', (error) => {
        logger.logError(error, { filename, operation: 'file_stream' });
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              code: 'STREAM_ERROR',
              message: 'Error streaming file',
            },
          });
        }
      });

      fileStream.on('end', () => {
        logger.logInfo('Download completed successfully', { filename });
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
