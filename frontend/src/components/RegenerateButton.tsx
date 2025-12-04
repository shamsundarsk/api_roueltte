import React from 'react';
import { RefreshIcon } from './Icons';
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
      <span className="button-icon">
        <RefreshIcon size={16} />
      </span>
      Regenerate
    </button>
  );
};

export default RegenerateButton;
