import axios, { AxiosError } from 'axios';
import type {
  MashupResponse,
  APIMetadata,
} from '../types';
import { getEnvConfig } from '../utils/validateEnv';

/**
 * Base URL for API requests, configured from environment variables
 */
const API_BASE_URL = getEnvConfig().VITE_API_BASE_URL;

/**
 * Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for generation
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Options for mashup generation
 */
export interface GenerateMashupOptions {
  excludeCategories?: string[];
  corsOnly?: boolean;
  excludeAPIIds?: string[];
}

/**
 * API response wrapper
 */
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Handle API errors and convert to APIError
 */
function handleAPIError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<APIResponse<any>>;
    
    if (axiosError.response?.data?.error) {
      const { code, message, details } = axiosError.response.data.error;
      throw new APIError(message, code, details);
    }
    
    if (axiosError.response) {
      throw new APIError(
        `Server error: ${axiosError.response.status}`,
        'SERVER_ERROR',
        axiosError.response.data
      );
    }
    
    if (axiosError.request) {
      throw new APIError(
        'No response from server. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
  }
  
  throw new APIError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
}

/**
 * Generate a new mashup with three random APIs
 * 
 * @param options - Optional generation parameters
 * @returns Promise resolving to mashup response
 * @throws APIError if generation fails
 */
export async function generateMashup(
  options?: GenerateMashupOptions
): Promise<MashupResponse> {
  try {
    const response = await apiClient.post<APIResponse<MashupResponse>>(
      '/mashup/generate',
      { options }
    );
    
    if (!response.data.success) {
      throw new APIError(
        response.data.error?.message || 'Mashup generation failed',
        response.data.error?.code,
        response.data.error?.details
      );
    }
    
    return response.data.data;
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Download the ZIP archive for a generated mashup
 * 
 * @param downloadUrl - The download URL from the mashup response (e.g., "/api/mashup/download/filename.zip")
 * @returns Promise resolving to blob data
 * @throws APIError if download fails
 */
export async function downloadMashup(downloadUrl: string): Promise<Blob> {
  try {
    // Extract the path after /api/ since our base URL already includes /api
    // downloadUrl format: "/api/mashup/download/filename.zip"
    // We need to remove "/api" to get: "/mashup/download/filename.zip"
    const path = downloadUrl.startsWith('/api/') 
      ? downloadUrl.substring(4)  // Remove "/api" (4 characters, not 5)
      : downloadUrl;
    
    const response = await apiClient.get(path, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Retrieve all APIs from the registry
 * 
 * @param filters - Optional filters for category and auth type
 * @returns Promise resolving to array of API metadata
 * @throws APIError if retrieval fails
 */
export async function getAPIs(filters?: {
  category?: string;
  authType?: 'none' | 'apikey' | 'oauth';
}): Promise<APIMetadata[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    
    if (filters?.authType) {
      params.append('authType', filters.authType);
    }
    
    const response = await apiClient.get<APIResponse<{ apis: APIMetadata[]; count: number }>>(
      '/registry/apis',
      { params }
    );
    
    if (!response.data.success) {
      throw new APIError(
        response.data.error?.message || 'Failed to retrieve APIs',
        response.data.error?.code,
        response.data.error?.details
      );
    }
    
    return response.data.data.apis;
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Trigger browser download for a blob
 * 
 * @param blob - The blob data to download
 * @param filename - The filename for the download
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default {
  generateMashup,
  downloadMashup,
  getAPIs,
  triggerBrowserDownload,
};
