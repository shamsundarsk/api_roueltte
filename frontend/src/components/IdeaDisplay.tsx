import React from 'react';
import { AppIdea } from '../types';
import { LightbulbIcon, ZapIcon } from './Icons';

interface IdeaDisplayProps {
  idea: AppIdea;
}

const IdeaDisplay: React.FC<IdeaDisplayProps> = ({ idea }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)',
      border: '1px solid var(--color-border)',
      borderRadius: '20px',
      padding: 'var(--space-10)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '6px 14px',
          background: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '20px',
          marginBottom: 'var(--space-5)'
        }}>
          <LightbulbIcon size={16} color="var(--color-primary)" />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            App Concept
          </span>
        </div>

        <h2 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: 'var(--space-4)',
          letterSpacing: '-0.02em',
          lineHeight: '1.2'
        }}>
          {idea.appName}
        </h2>

        <p style={{
          fontSize: '17px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.7',
          marginBottom: 'var(--space-8)',
          maxWidth: '720px'
        }}>
          {idea.description}
        </p>

        <div style={{
          display: 'grid',
          gap: 'var(--space-6)',
          marginTop: 'var(--space-8)'
        }}>
          {/* Features */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                background: 'var(--color-primary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                <ZapIcon size={14} color="white" />
              </span>
              <span>Key Features</span>
            </h3>
            <div style={{
              display: 'grid',
              gap: 'var(--space-3)'
            }}>
              {idea.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    animation: `slideUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    background: 'var(--color-bg-alt)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <span style={{
                    fontSize: '15px',
                    color: 'var(--color-text)',
                    lineHeight: '1.6'
                  }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rationale */}
          <div style={{
            padding: 'var(--space-6)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            borderLeft: '4px solid var(--color-secondary)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                background: 'var(--color-secondary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                <LightbulbIcon size={14} color="white" />
              </span>
              <span>Why This Works</span>
            </h3>
            <p style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.7'
            }}>
              {idea.rationale}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDisplay;
