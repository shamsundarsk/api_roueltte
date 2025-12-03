import React from 'react';
import { MashupResponse } from '../types';
import APICard from './APICard';
import IdeaDisplay from './IdeaDisplay';
import CodePreview from './CodePreview';
import UILayoutDisplay from './UILayoutDisplay';
import DownloadButton from './DownloadButton';
import RegenerateButton from './RegenerateButton';
import './MashupResults.css';

interface MashupResultsProps {
  mashupData: MashupResponse;
  onDownload: () => void;
  onRegenerate: () => void;
  isDownloading?: boolean;
  downloadSuccess?: boolean;
}

/**
 * MashupResults Component
 * Main results container that displays all mashup generation results
 * 
 * Displays:
 * - Three selected APIs with metadata using APICard components
 * - App idea with name, description, features, rationale
 * - Code preview with folder structure and snippets
 * - UI layout suggestions with screens, components, flow
 * - Download and Regenerate buttons
 * 
 * Requirements: 1.5, 8.4, 9.1, 9.2
 */
const MashupResults: React.FC<MashupResultsProps> = ({
  mashupData,
  onDownload,
  onRegenerate,
  isDownloading = false,
  downloadSuccess = false,
}) => {
  return (
    <div className="mashup-results">
      <div className="action-buttons">
        <DownloadButton 
          onClick={onDownload} 
          isDownloading={isDownloading}
          downloadSuccess={downloadSuccess}
        />
        <RegenerateButton onClick={onRegenerate} />
      </div>

      <section className="apis-section">
        <h2 className="section-heading">Selected APIs</h2>
        <div className="apis-grid">
          {mashupData.idea.apis.map((api) => (
            <APICard key={api.id} api={api} />
          ))}
        </div>
      </section>

      <section className="idea-section">
        <IdeaDisplay idea={mashupData.idea} />
      </section>

      <section className="preview-section">
        <CodePreview codePreview={mashupData.codePreview} />
      </section>

      <section className="layout-section">
        <UILayoutDisplay uiLayout={mashupData.uiLayout} />
      </section>
    </div>
  );
};

export default MashupResults;
