import React from 'react';
import './DownloadButton.css';

interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isDownloading?: boolean;
  downloadSuccess?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  onClick, 
  disabled = false,
  isDownloading = false,
  downloadSuccess = false
}) => {
  const getButtonContent = () => {
    if (isDownloading) {
      return (
        <>
          <span className="button-icon spinner">⟳</span>
          Downloading...
        </>
      );
    }
    
    if (downloadSuccess) {
      return (
        <>
          <span className="button-icon">✓</span>
          Downloaded!
        </>
      );
    }
    
    return (
      <>
        <span className="button-icon">⬇</span>
        Download Project
      </>
    );
  };

  return (
    <button
      className={`download-button ${downloadSuccess ? 'success' : ''}`}
      onClick={onClick}
      disabled={disabled || isDownloading}
    >
      {getButtonContent()}
    </button>
  );
};

export default DownloadButton;
