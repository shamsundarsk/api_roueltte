import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      className="btn btn-primary btn-lg"
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: '220px',
        fontSize: '16px',
        fontWeight: 600,
        letterSpacing: '-0.01em'
      }}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none" 
        style={{ marginRight: '4px' }}
      >
        <path 
          d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 15.5L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" 
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
      <span>Generate Mashup</span>
    </button>
  );
};

export default GenerateButton;
