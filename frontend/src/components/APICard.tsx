import React from 'react';
import { APIMetadata } from '../types';
import { 
  MoneyIcon, 
  FlaskIcon, 
  RobotIcon, 
  ChatIcon, 
  CodeIcon,
  ZapIcon
} from './Icons';

interface APICardProps {
  api: APIMetadata;
  index?: number;
}

const getCategoryIcon = (category: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    finance: <MoneyIcon size={24} />,
    science: <FlaskIcon size={24} />,
    ai: <RobotIcon size={24} />,
    social: <ChatIcon size={24} />,
    developer: <CodeIcon size={24} />,
  };
  return iconMap[category.toLowerCase()] || <ZapIcon size={24} />;
};

const getAuthBadgeColor = (authType: string): { bg: string; text: string } => {
  switch (authType) {
    case 'none':
      return { bg: 'rgba(20, 184, 166, 0.1)', text: '#0D9488' };
    case 'apikey':
      return { bg: 'rgba(124, 58, 237, 0.1)', text: '#6D28D9' };
    case 'oauth':
      return { bg: 'rgba(249, 115, 22, 0.1)', text: '#EA580C' };
    default:
      return { bg: 'rgba(120, 113, 108, 0.1)', text: '#57534E' };
  }
};

const APICard: React.FC<APICardProps> = ({ api, index = 0 }) => {
  const authColors = getAuthBadgeColor(api.authType);
  
  return (
    <div 
      className="card"
      style={{
        animation: `slideUp 0.4s ease-out ${index * 0.1}s both`,
        cursor: 'default'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'var(--color-bg-alt)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
          border: '1px solid var(--color-border)'
        }}>
          {getCategoryIcon(api.category)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-1)',
            letterSpacing: '-0.01em'
          }}>
            {api.name}
          </h3>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {api.category}
          </span>
        </div>
      </div>

      <p style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.6',
        marginBottom: 'var(--space-4)'
      }}>
        {api.description}
      </p>

      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        flexWrap: 'wrap'
      }}>
        <span style={{
          padding: '4px 10px',
          background: authColors.bg,
          color: authColors.text,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'capitalize'
        }}>
          {api.authType === 'none' ? 'No Auth' : api.authType}
        </span>
        {api.corsCompatible && (
          <span style={{
            padding: '4px 10px',
            background: 'rgba(20, 184, 166, 0.1)',
            color: '#0D9488',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            CORS ✓
          </span>
        )}
        {api.mockData && (
          <span style={{
            padding: '4px 10px',
            background: 'rgba(249, 115, 22, 0.1)',
            color: '#EA580C',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            Mock Mode
          </span>
        )}
      </div>

      <a
        href={api.documentationUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-primary)',
          textDecoration: 'none',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.gap = 'var(--space-3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.gap = 'var(--space-2)';
        }}
      >
        <span>View Docs</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>
  );
};

export default APICard;
