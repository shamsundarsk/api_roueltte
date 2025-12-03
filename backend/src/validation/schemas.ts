import Joi from 'joi';

/**
 * Validation schemas for API requests
 */

// Schema for mashup generation options
export const generateMashupSchema = Joi.object({
  options: Joi.object({
    excludeCategories: Joi.array().items(Joi.string()).optional(),
    requireAuth: Joi.boolean().optional(),
    corsOnly: Joi.boolean().optional(),
    excludeAPIIds: Joi.array().items(Joi.string()).optional(),
  }).optional(),
});

// Schema for API metadata
export const apiMetadataSchema = Joi.object({
  id: Joi.string().required().trim().min(1),
  name: Joi.string().required().trim().min(1),
  description: Joi.string().required().trim().min(1),
  category: Joi.string().required().trim().min(1),
  baseUrl: Joi.string().required().trim().uri(),
  sampleEndpoint: Joi.string().required().trim().min(1),
  authType: Joi.string().valid('none', 'apikey', 'oauth').required(),
  corsCompatible: Joi.boolean().required(),
  mockData: Joi.object().optional(),
  documentationUrl: Joi.string().required().trim().uri(),
});

// Schema for API filtering query parameters
export const apiFilterSchema = Joi.object({
  category: Joi.string().optional().trim(),
  authType: Joi.string().valid('none', 'apikey', 'oauth').optional(),
});
