/**
 * Ollama Client Wrapper
 * Handles communication with local Ollama LLM
 */

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaGenerateOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Generate text using Ollama local LLM
 * @param prompt The prompt to send to the LLM
 * @param options Optional configuration
 * @returns Generated text response
 */
export async function generate(
  prompt: string,
  options: OllamaGenerateOptions = {}
): Promise<string> {
  const {
    model = 'llama3',
    temperature = 0.7,
    max_tokens = 1000,
  } = options;

  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const endpoint = `${ollamaUrl}/api/generate`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
          num_predict: max_tokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaResponse;
    return data.response.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        throw new Error(
          'Could not connect to Ollama. Make sure Ollama is running at ' + ollamaUrl
        );
      }
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred during LLM generation');
  }
}

/**
 * Check if Ollama is available
 * @returns True if Ollama is running and accessible
 */
export async function isAvailable(): Promise<boolean> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
