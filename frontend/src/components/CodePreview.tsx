import React, { useState } from 'react';
import { CodePreview as CodePreviewType, FileStructure } from '../types';
import './CodePreview.css';

interface CodePreviewProps {
  codePreview: CodePreviewType;
}

const CodePreview: React.FC<CodePreviewProps> = ({ codePreview }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['structure']));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderFileStructure = (structure: FileStructure, level: number = 0): React.ReactNode => {
    const indent = level * 20;
    const icon = structure.type === 'directory' ? '📁' : '📄';

    return (
      <div key={structure.name} style={{ marginLeft: `${indent}px` }}>
        <div className="structure-item">
          <span className="structure-icon">{icon}</span>
          <span className="structure-name">{structure.name}</span>
        </div>
        {structure.children?.map((child) => renderFileStructure(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="code-preview">
      <h3 className="preview-title">Code Preview</h3>

      <div className="preview-section">
        <button
          className="section-header"
          onClick={() => toggleSection('structure')}
        >
          <span className="section-toggle">
            {expandedSections.has('structure') ? '▼' : '▶'}
          </span>
          <span className="section-title">Project Structure</span>
        </button>
        {expandedSections.has('structure') && (
          <div className="section-content">
            <div className="file-structure">
              {renderFileStructure(codePreview.structure)}
            </div>
          </div>
        )}
      </div>

      <div className="preview-section">
        <button
          className="section-header"
          onClick={() => toggleSection('backend')}
        >
          <span className="section-toggle">
            {expandedSections.has('backend') ? '▼' : '▶'}
          </span>
          <span className="section-title">Backend Entry Point</span>
        </button>
        {expandedSections.has('backend') && (
          <div className="section-content">
            <pre className="code-snippet">
              <code>{codePreview.backendSnippet}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="preview-section">
        <button
          className="section-header"
          onClick={() => toggleSection('frontend')}
        >
          <span className="section-toggle">
            {expandedSections.has('frontend') ? '▼' : '▶'}
          </span>
          <span className="section-title">Frontend Entry Point</span>
        </button>
        {expandedSections.has('frontend') && (
          <div className="section-content">
            <pre className="code-snippet">
              <code>{codePreview.frontendSnippet}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
