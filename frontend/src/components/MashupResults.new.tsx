import React, { useState } from 'react';
import { MashupResponse } from '../types';
import APICard from './APICard';
import IdeaDisplay from './IdeaDisplay';
import CodePreview from './CodePreview';
import UILayoutDisplay from './UILayoutDisplay';

interface MashupResultsProps {
  mashupData: MashupResponse;
  onDownload: () => void;
  onRegenerate: () => void;
  isDownloading?: boolean;
  downloadSuccess?: boolean;
}

const MashupResults: React.FC<MashupResultsProps> = ({
  mashupData,
  onDownload,
  onRegenerate,
  isDownloading = false,
  downloadSuccess = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'ui'>('overview');

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Sticky Action Bar */}
      <div style={{
        position: 'sticky',
        top: '73px',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-8)',
        padding: 'var(--space-4) 0'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)'
          }}>
            {/* Project Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {mashupData.idea.appName}
              </h2>
              <p style={{
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                margin: '2px 0 0 0'
              }}>
                {mashupData.idea.apis.length} APIs • Generated {new Date(mashupData.timestamp).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                className="btn btn-secondary"
                onClick={onRegenerate}
                style={{ minWidth: '120px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.12583 3 10.1647 3.37194 11 3.99963M11 3.99963V1M11 3.99963H8" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Regenerate</span>
              </button>
              <button
                className="btn btn-success"
                onClick={onDownload}
                disabled={isDownloading}
                style={{ minWidth: '140px' }}
              >
                {isDownloading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    <span>Preparing...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <span>✓</span>
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1V11M8 11L11 8M8 11L5 8M2 11V13C2 14.1046 2.89543 15 4 15H12C13.1046 15 14 14.1046 14 13V11" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container" style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{
          display: 'inline-flex',
          gap: 'var(--space-1)',
          padding: 'var(--space-1)',
          background: 'var(--color-bg-alt)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📋' },
            { id: 'code', label: 'Code', icon: '💻' },
            { id: 'ui', label: 'UI Design', icon: '🎨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container">
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <IdeaDisplay idea={mashupData.idea} />
            
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: 'var(--space-5)',
                letterSpacing: '-0.01em'
              }}>
                Selected APIs
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-4)'
              }}>
                {mashupData.idea.apis.map((api, index) => (
                  <APICard key={api.id} api={api} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <CodePreview codePreview={mashupData.codePreview} />
        )}

        {activeTab === 'ui' && (
          <UILayoutDisplay uiLayout={mashupData.uiLayout} />
        )}
      </div>
    </div>
  );
};

export default MashupResults;
