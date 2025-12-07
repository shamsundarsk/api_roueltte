/**
 * Idea Generator Module
 * Main export for the AI Idea Generator powered by Ollama
 * 
 * This module provides:
 * - Random API selection
 * - LLM-powered idea generation
 * - Self-contained, offline-capable functionality
 * 
 * Usage:
 *   import ideaGeneratorRouter from './modules/idea-generator';
 *   app.use('/api', ideaGeneratorRouter);
 */

export { default as router } from './router';
export { getRandomAPIs } from './randomizer';
export { buildIdeaPrompt } from './promptBuilder';
export * as ollamaClient from './ollamaClient';
