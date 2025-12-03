import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Generating your mashup...' 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 'var(--space-6)',
      animation: 'fadeIn var(--transition-base) ease-out'
    }}>
      <div style={{
        position: 'relative',
        width: '80px',
        height: '80px'
      }}>
        <div className="spinner spinner-lg" style={{
          width: '80px',
          height: '80px',
          borderWidth: '4px'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '32px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          ✨
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)'
        }}>
          {message}
        </p>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)'
        }}>
          This may take a few moments
        </p>
      </div>
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginTop: 'var(--space-4)'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
