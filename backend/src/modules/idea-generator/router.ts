/**
 * Idea Generator Router
 * Exposes module endpoints
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

/**
 * GET /idea
 * Generate a new hackathon project idea
 */
router.get('/idea', controller.generateIdea);

/**
 * GET /idea/health
 * Check module and Ollama status
 */
router.get('/idea/health', controller.healthCheck);

export default router;
