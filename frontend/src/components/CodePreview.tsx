import React, { useState } from 'react';
import { CodePreview as CodePreviewType, FileStructure } from '../types';
import { FolderIcon, FileIcon, ServerIcon, MonitorIcon } from './Icons';
import './CodePreview.css';

interface CodePreviewProps {
  codePreview: CodePreviewType;
}

const CodePreview: React.FC<CodePreviewProps> = ({ codePreview }) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'backend' | 'frontend'>('structure');

  const renderFileStructure = (structure: FileStructure, level: number = 0): React.ReactNode => {
    const indent = level * 24;
    const isDirectory = structure.type === 'directory';

    return (
      <div key={structure.name} style={{ marginLeft: `${indent}px` }}>
        <div className="structure-item">
          <span className="structure-icon">
            {isDirectory ? <FolderIcon size={16} color="#2ecc70" /> : <FileIcon size={16} color="#718096" />}
          </span>
          <span className="structure-name">{structure.name}</span>
        </div>
        {structure.children?.map((child) => renderFileStructure(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="code-preview">
      {/* Tab Navigation */}
      <div className="preview-tabs">
        <button
          className={`preview-tab ${activeTab === 'structure' ? 'active' : ''}`}
          onClick={() => setActiveTab('structure')}
        >
          <FolderIcon size={18} />
          <span>Project Structure</span>
        </button>
        <button
          className={`preview-tab ${activeTab === 'backend' ? 'active' : ''}`}
          onClick={() => setActiveTab('backend')}
        >
          <ServerIcon size={18} />
          <span>Backend Code</span>
        </button>
        <button
          className={`preview-tab ${activeTab === 'frontend' ? 'active' : ''}`}
          onClick={() => setActiveTab('frontend')}
        >
          <MonitorIcon size={18} />
          <span>Frontend Code</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="preview-content">
        {activeTab === 'structure' && (
          <div className="tab-panel">
            <div className="file-structure">
              {renderFileStructure(codePreview.structure)}
            </div>
          </div>
        )}

        {activeTab === 'backend' && (
          <div className="tab-panel">
            <div className="code-header">
              <ServerIcon size={20} color="#2ecc70" />
              <span className="code-label">server.js</span>
            </div>
            <pre className="code-snippet">
              <code>{codePreview.backendSnippet}</code>
            </pre>
          </div>
        )}

        {activeTab === 'frontend' && (
          <div className="tab-panel">
            <div className="code-header">
              <MonitorIcon size={20} color="#2ecc70" />
              <span className="code-label">App.jsx</span>
            </div>
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
