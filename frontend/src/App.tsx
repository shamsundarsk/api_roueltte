import { useState } from 'react';
import './App.css';
import {
  GenerateButton,
  LoadingSpinner,
  MashupResults,
} from './components';
import { AIChatbot } from './components/AIChatbot';
import { useMashup } from './context';

function App() {
  const { 
    mashupData, 
    isLoading, 
    error, 
    generate, 
    regenerate, 
    download,
    clearError,
    isDownloading,
    downloadSuccess
  } = useMashup();
  
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleGenerate = () => {
    generate();
  };

  const handleDownload = () => {
    download();
  };

  const handleRegenerate = () => {
    regenerate();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">✨</div>
              <div>
                <h1 className="logo-title">Mashup Maker</h1>
                <p className="logo-subtitle">AI-Powered API Mashup Generator</p>
              </div>
            </div>
            {mashupData && (
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setIsChatbotOpen(true)}
              >
                <span>🤖</span>
                <span>AI Assistant</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-error animate-slideDown">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <p className="alert-message">{error}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={clearError}>
                Dismiss
              </button>
            </div>
          )}

          {/* Empty State */}
          {!mashupData && !isLoading && (
            <div className="empty-state animate-fadeIn">
              <div className="empty-state-content">
                <div className="empty-state-icon">🎲</div>
                <h2 className="empty-state-title">Create Your Next Project</h2>
                <p className="empty-state-description">
                  Generate unique app concepts by combining three random APIs.
                  Get complete code scaffolding, UI suggestions, and instant downloads.
                </p>
                <div className="empty-state-features">
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Instant Generation</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📦</span>
                    <span>Full Stack Code</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🤖</span>
                    <span>AI Assistant</span>
                  </div>
                </div>
                <GenerateButton onClick={handleGenerate} disabled={isLoading} />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingSpinner />}

          {/* Results */}
          {mashupData && !isLoading && (
            <div className="animate-slideUp">
              <MashupResults
                mashupData={mashupData}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
                isDownloading={isDownloading}
                downloadSuccess={downloadSuccess}
              />
            </div>
          )}
        </div>
      </main>

      {/* AI Chatbot Sidebar */}
      {mashupData && (
        <AIChatbot 
          isOpen={isChatbotOpen} 
          onClose={() => setIsChatbotOpen(false)} 
        />
      )}

      {/* Floating Action Button (Mobile) */}
      {mashupData && !isChatbotOpen && (
        <button 
          className="chatbot-fab"
          onClick={() => setIsChatbotOpen(true)}
          title="AI Project Assistant"
        >
          <span className="fab-icon">🤖</span>
        </button>
      )}
    </div>
  );
}

export default App;
