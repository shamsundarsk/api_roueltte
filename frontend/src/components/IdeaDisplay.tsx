import React from 'react';
import { AppIdea } from '../types';
import { LightbulbIcon, ZapIcon, CodeIcon } from './Icons';

interface IdeaDisplayProps {
  idea: AppIdea;
}

const IdeaDisplay: React.FC<IdeaDisplayProps> = ({ idea }) => {
  return (
    <div style={{
      background: '#1a1f2e',
      border: '1px solid rgba(46, 204, 112, 0.2)',
      borderRadius: '16px',
      padding: '48px',
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
        background: 'radial-gradient(circle, rgba(46, 204, 112, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(46, 204, 112, 0.1)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <LightbulbIcon size={18} color="#2ecc70" />
          <span style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#2ecc70',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Your Mashup Idea
          </span>
        </div>

        <h2 style={{
          fontSize: '40px',
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
          lineHeight: '1.2'
        }}>
          {idea.appName}
        </h2>

        <p style={{
          fontSize: '18px',
          color: '#a0aec0',
          lineHeight: '1.8',
          marginBottom: '32px',
          fontWeight: 400
        }}>
          {idea.description}
        </p>

        {/* Use Case Explanation */}
        <div style={{
          background: 'rgba(46, 204, 112, 0.1)',
          border: '2px solid #2ecc70',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#2ecc70',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CodeIcon size={18} color="white" />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0
            }}>
              How These 3 APIs Work Together
            </h3>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#e2e8f0',
            lineHeight: '1.8',
            margin: 0,
            fontWeight: 500
          }}>
            {idea.rationale}
          </p>
        </div>

        {/* Features */}
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#2ecc70',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ZapIcon size={18} color="white" />
            </div>
            <span>Key Features</span>
          </h3>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {idea.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(46, 204, 112, 0.2)',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  animation: `slideUp 0.3s ease-out ${index * 0.05}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.borderColor = '#2ecc70';
                  e.currentTarget.style.background = 'rgba(46, 204, 112, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = 'rgba(46, 204, 112, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  background: '#2ecc70',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0f1419',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <span style={{
                  fontSize: '16px',
                  color: '#ffffff',
                  lineHeight: '1.8',
                  fontWeight: 500
                }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDisplay;
