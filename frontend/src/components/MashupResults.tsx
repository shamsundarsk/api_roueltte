import React from 'react';
import { MashupResponse } from '../types';
import APICard from './APICard';
import IdeaDisplay from './IdeaDisplay';
import CodePreview from './CodePreview';
import UILayoutDisplay from './UILayoutDisplay';
import DownloadButton from './DownloadButton';
import RegenerateButton from './RegenerateButton';
import { CustomGenerateButton } from './CustomGenerateButton';
import { FAQ } from './FAQ';
import './MashupResults.css';

interface MashupResultsProps {
  mashupData: MashupResponse;
  onDownload: () => void;
  onRegenerate: () => void;
  onCustomGenerate: (apiIds: string[]) => void;
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
  onCustomGenerate,
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
        <CustomGenerateButton onGenerate={onCustomGenerate} />
      </div>

      <section className="apis-section">
        <h2 className="section-heading">
          <span className="heading-number">1</span>
          Selected APIs for Your Mashup
        </h2>
        <p className="section-description">
          These three APIs have been carefully selected to work together and create something unique.
        </p>
        <div className="apis-grid">
          {mashupData.idea.apis.map((api, index) => (
            <APICard key={api.id} api={api} index={index} />
          ))}
        </div>
      </section>

      <section className="idea-section">
        <h2 className="section-heading">
          <span className="heading-number">2</span>
          Your Project Concept
        </h2>
        <p className="section-description">
          Here's a complete project idea that combines all three APIs into a functional application.
        </p>
        <IdeaDisplay idea={mashupData.idea} />
      </section>

      <section className="preview-section">
        <h2 className="section-heading">
          <span className="heading-number">3</span>
          Code Preview
        </h2>
        <p className="section-description">
          Get a glimpse of the generated code structure and implementation.
        </p>
        <CodePreview codePreview={mashupData.codePreview} />
      </section>

      <section className="layout-section">
        <h2 className="section-heading">
          <span className="heading-number">4</span>
          UI Layout Suggestions
        </h2>
        <p className="section-description">
          Recommended screens and components to build your user interface.
        </p>
        <UILayoutDisplay uiLayout={mashupData.uiLayout} />
      </section>

      <section className="faq-section">
        <h2 className="section-heading">
          <span className="heading-number">5</span>
          Frequently Asked Questions
        </h2>
        <p className="section-description">
          Everything you need to know to get started with your project.
        </p>
        <FAQ isOpen={true} onClose={() => {}} inline={true} />
      </section>
    </div>
  );
};

export default MashupResults;
