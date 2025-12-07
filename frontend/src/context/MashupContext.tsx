import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MashupResponse } from '../types';
import { generateMashup, downloadMashup, triggerBrowserDownload } from '../services/api.service';

/**
 * Mashup state interface
 */
interface MashupState {
  mashupData: MashupResponse | null;
  isLoading: boolean;
  error: string | null;
  previousAPIIds: string[];
  isDownloading: boolean;
  downloadSuccess: boolean;
}

/**
 * Mashup context actions interface
 */
interface MashupContextType extends MashupState {
  // Actions
  generate: () => Promise<void>;
  generateCustom: (apiIds: string[]) => Promise<void>;
  regenerate: () => Promise<void>;
  download: () => Promise<void>;
  setMashupData: (data: MashupResponse | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Create the Mashup Context
 */
const MashupContext = createContext<MashupContextType | undefined>(undefined);

/**
 * Mashup Provider Props
 */
interface MashupProviderProps {
  children: ReactNode;
}

/**
 * Mashup Provider Component
 * Manages all mashup-related state and actions
 */
export const MashupProvider: React.FC<MashupProviderProps> = ({ children }) => {
  const [mashupData, setMashupData] = useState<MashupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousAPIIds, setPreviousAPIIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  /**
   * Generate a new mashup
   * Calls the backend API to generate a mashup with three random APIs
   * Validates: Requirements 1.1, 1.3, 1.5
   */
  const generate = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the API to generate a new mashup
      const response = await generateMashup();
      
      // Update state with the new mashup data
      setMashupData(response);
      
      // Track the API IDs for potential regeneration
      setPreviousAPIIds(response.idea.apis.map(api => api.id));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate mashup';
      setError(errorMessage);
      setMashupData(null);
      setPreviousAPIIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Regenerate a mashup with different APIs
   * Excludes previously selected APIs to ensure different results
   * Validates: Requirements 7.1, 7.2, 7.3, 7.5
   */
  const regenerate = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the API to generate a new mashup, excluding previous APIs
      const response = await generateMashup({ 
        excludeAPIIds: previousAPIIds 
      });
      
      // Replace all displayed content with new mashup data
      setMashupData(response);
      
      // Update the tracked API IDs for future regenerations
      setPreviousAPIIds(response.idea.apis.map(api => api.id));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate mashup';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate a custom mashup with user-selected APIs
   */
  const generateCustom = async (apiIds: string[]): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the custom generation endpoint
      const response = await fetch('/api/mashup/generate-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiIds }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to generate custom mashup');
      }

      // Set the mashup data
      setMashupData(data.data);
      
      // Track the API IDs for future regenerations
      setPreviousAPIIds(data.data.idea.apis.map((api: any) => api.id));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate custom mashup';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Download the current mashup project
   * Fetches the ZIP file from the backend and triggers browser download
   */
  const download = async (): Promise<void> => {
    try {
      if (!mashupData) {
        setError('No mashup data available to download');
        return;
      }
      
      setIsDownloading(true);
      setError(null);
      setDownloadSuccess(false);
      
      // Fetch the ZIP file from the backend
      const blob = await downloadMashup(mashupData.downloadUrl);
      
      // Extract filename from the app name or use a default
      const filename = `${mashupData.idea.appName.toLowerCase().replace(/\s+/g, '-')}.zip`;
      
      // Trigger browser download
      triggerBrowserDownload(blob, filename);
      
      // Show success feedback
      setDownloadSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download project';
      setError(errorMessage);
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: MashupContextType = {
    // State
    mashupData,
    isLoading,
    error,
    previousAPIIds,
    isDownloading,
    downloadSuccess,
    
    // Actions
    generate,
    generateCustom,
    regenerate,
    download,
    setMashupData,
    setError,
    clearError,
  };

  return (
    <MashupContext.Provider value={value}>
      {children}
    </MashupContext.Provider>
  );
};

/**
 * Custom hook to use the Mashup Context
 * Throws an error if used outside of MashupProvider
 */
export const useMashup = (): MashupContextType => {
  const context = useContext(MashupContext);
  
  if (context === undefined) {
    throw new Error('useMashup must be used within a MashupProvider');
  }
  
  return context;
};
