import React from 'react';
import './RegenerateButton.css';

interface RegenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      className="regenerate-button"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="button-icon">🔄</span>
      Regenerate
    </button>
  );
};

export default RegenerateButton;
