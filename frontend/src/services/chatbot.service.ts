import axios from 'axios';
import { getEnvConfig } from '../utils/validateEnv';
import type { MashupResponse } from '../types';

const API_BASE_URL = getEnvConfig().VITE_API_BASE_URL;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ErrorContext {
  errorMessage: string;
  stackTrace?: string;
  fileName?: string;
  lineNumber?: number;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  projectContext?: MashupResponse;
  errorContext?: ErrorContext;
}

export interface ChatResponse {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatbotStatus {
  configured: boolean;
  message: string;
}

/**
 * Send a message to the AI chatbot
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/chatbot/chat`, request);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to send message. Please try again.');
  }
}

/**
 * Get quick help for a specific topic
 */
export async function getQuickHelp(topic: string): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/chatbot/quick-help/${topic}`);
    return response.data.data.help;
  } catch (error) {
    throw new Error('Failed to retrieve quick help.');
  }
}

/**
 * Check if the chatbot is configured
 */
export async function getChatbotStatus(): Promise<ChatbotStatus> {
  try {
    const response = await axios.get(`${API_BASE_URL}/chatbot/status`);
    return response.data.data;
  } catch (error) {
    return {
      configured: false,
      message: 'Unable to check chatbot status',
    };
  }
}
