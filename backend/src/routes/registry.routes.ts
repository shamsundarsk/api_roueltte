import { Router, Request, Response, NextFunction } from 'express';
import { APIRegistry } from '../registry/APIRegistry';
import { validateRequest, validateQuery } from '../middleware/validator';
import { apiMetadataSchema, apiFilterSchema } from '../validation/schemas';

const router = Router();

// Initialize registry
const registry = new APIRegistry();

/**
 * GET /api/registry/apis
 * Retrieve all APIs from the registry with optional filtering
 * Validates: Requirements 5.5
 */
router.get(
  '/apis',
  validateQuery(apiFilterSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, authType } = req.query;

      let apis;

      // Apply filters if provided
      if (category && typeof category === 'string') {
        apis = registry.getAPIsByCategory(category);
      } else if (authType && (authType === 'none' || authType === 'apikey' || authType === 'oauth')) {
        apis = registry.getAPIsByAuthType(authType);
      } else {
        apis = registry.getAllAPIs();
      }

      res.status(200).json({
        success: true,
        data: {
          apis,
          count: apis.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/registry/categories
 * Get all available API categories
 */
router.get(
  '/categories',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allAPIs = registry.getAllAPIs();
      const categories = new Set<string>();
      const categoryData: { [key: string]: number } = {};

      // Count APIs per category
      for (const api of allAPIs) {
        categories.add(api.category);
        categoryData[api.category] = (categoryData[api.category] || 0) + 1;
      }

      res.status(200).json({
        success: true,
        data: {
          categories: Array.from(categories).sort(),
          categoryData,
          totalCategories: categories.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/registry/apis
 * Add a new API to the registry
 * Validates: Requirements 5.4
 */
router.post(
  '/apis',
  validateRequest(apiMetadataSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiMetadata = req.body;

      // Add API to registry (validation happens inside addAPI)
      registry.addAPI(apiMetadata);

      res.status(201).json({
        success: true,
        data: {
          id: apiMetadata.id,
          message: 'API added successfully',
        },
      });
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_API',
              message: error.message,
            },
          });
          return;
        } else if (error.message.includes('Invalid API metadata')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_API_METADATA',
              message: error.message,
            },
          });
          return;
        }
      }
      next(error);
    }
  }
);

export default router;
