/**
 * Idea Generator Controller
 * Handles the /idea endpoint logic
 */

import { Request, Response } from 'express';
import { getRandomAPIs } from './randomizer';
import { buildIdeaPrompt } from './promptBuilder';
import * as ollamaClient from './ollamaClient';

/**
 * Generate a hackathon project idea using local LLM
 */
export async function generateIdea(_req: Request, res: Response): Promise<void> {
  try {
    // Check if Ollama is available
    const isOllamaAvailable = await ollamaClient.isAvailable();
    if (!isOllamaAvailable) {
      res.status(503).json({
        success: false,
        error: 'Could not reach local LLM. Please ensure Ollama is running.',
        hint: 'Run: ollama serve',
      });
      return;
    }

    // Get random APIs
    const apis = getRandomAPIs(3);

    // Build prompt
    const prompt = buildIdeaPrompt(apis);

    // Generate idea using LLM
    const idea = await ollamaClient.generate(prompt, {
      model: process.env.OLLAMA_MODEL || 'llama3',
      temperature: 0.8,
      max_tokens: 1500,
    });

    // Return structured response
    res.status(200).json({
      success: true,
      data: {
        apis,
        idea,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Idea generation error:', error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate idea',
    });
  }
}

/**
 * Health check for the idea generator module
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const isOllamaAvailable = await ollamaClient.isAvailable();

  res.status(200).json({
    success: true,
    data: {
      module: 'idea-generator',
      status: 'operational',
      ollama: {
        available: isOllamaAvailable,
        url: process.env.OLLAMA_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3',
      },
    },
  });
}
