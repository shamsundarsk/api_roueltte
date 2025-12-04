import { useState } from 'react';
import './App.css';
import {
  LoadingSpinner,
  MashupResults,
} from './components';
import { AIChatbot } from './components/AIChatbot';
import { DiceIcon, LightbulbIcon, CompassIcon, RocketIcon, RobotIcon, AlertIcon } from './components/Icons';
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

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show results page if data exists
  if (mashupData && !isLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
                </svg>
              </div>
              <h1 className="logo-title">API Roulette</h1>
            </div>
            <div className="header-nav">
              <button 
                className="login-btn"
                onClick={() => setIsChatbotOpen(true)}
              >
                AI Assistant
              </button>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '40px 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
            {error && (
              <div className="alert alert-error animate-slideDown">
                <span className="alert-icon">
                  <AlertIcon size={20} />
                </span>
                <div className="alert-content">
                  <p className="alert-message">{error}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={clearError}>
                  Dismiss
                </button>
              </div>
            )}

            <MashupResults
              mashupData={mashupData}
              onDownload={handleDownload}
              onRegenerate={handleRegenerate}
              isDownloading={isDownloading}
              downloadSuccess={downloadSuccess}
            />
          </div>
        </main>

        <AIChatbot 
          isOpen={isChatbotOpen} 
          onClose={() => setIsChatbotOpen(false)} 
        />

        {!isChatbotOpen && (
          <button 
            className="chatbot-fab"
            onClick={() => setIsChatbotOpen(true)}
            title="AI Project Assistant"
          >
            <RobotIcon size={24} color="white" />
          </button>
        )}
      </div>
    );
  }

  // Show landing page
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <DiceIcon size={40} color="var(--primary-500)" />
            </div>
            <h1 className="logo-title">API Roulette</h1>
          </div>
          <div className="header-nav">
            <nav className="nav-links">
              <a href="#features" className="nav-link" onClick={scrollToFeatures}>Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#about" className="nav-link">About</a>
            </nav>
            <button className="login-btn">Login</button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error animate-slideDown" style={{ maxWidth: '1400px', margin: '0 auto 32px', padding: '0 40px' }}>
          <span className="alert-icon">
            <AlertIcon size={20} />
          </span>
          <div className="alert-content">
            <p className="alert-message">{error}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Section */}
      {!isLoading && (
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Unleash Your Next Hackathon Idea</h1>
            <p className="hero-description">
              Randomly combine 3 powerful APIs to spark innovative projects.
            </p>
            <button className="hero-cta" onClick={handleGenerate}>
              Start Your Hackathon Journey
            </button>
          </div>
          <div className="hero-illustration">
            <svg style={{ width: '100%', height: 'auto', maxWidth: '600px' }} viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3498DB', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#2ECC71', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <g fill="none" stroke="url(#grad1)" strokeWidth="2">
                <path d="M50 200 Q 150 100 250 200 T 450 200" />
                <path d="M100 350 C 200 250, 400 250, 500 350" />
                <path d="M150 50 L 250 150 L 350 50" />
                <path d="M400 100 C 450 200, 350 300, 550 200" />
              </g>
              <g fill="url(#grad1)" opacity="0.3">
                <circle cx="50" cy="200" r="8" />
                <circle cx="250" cy="200" r="8" />
                <circle cx="450" cy="200" r="8" />
                <circle cx="100" cy="350" r="6" />
                <circle cx="500" cy="350" r="6" />
                <circle cx="150" cy="50" r="5" />
                <circle cx="350" cy="50" r="5" />
                <circle cx="400" cy="100" r="7" />
                <circle cx="550" cy="200" r="7" />
              </g>
            </svg>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 40px' }}>
          <LoadingSpinner />
        </div>
      )}

      {/* Features Section */}
      {!isLoading && (
        <section id="features" className="features-section">
          <div className="features-header">
            <h2 className="features-title">How It Works</h2>
            <p className="features-description">
              Discover endless possibilities by instantly generating unique combinations of APIs for your next project. Our platform simplifies the brainstorming process, helping you find the perfect stack to build innovative applications.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <LightbulbIcon size={32} />
              </div>
              <h3 className="feature-title">Instant Inspiration</h3>
              <p className="feature-description">
                Get a random combination of three powerful APIs to kickstart your creativity.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <CompassIcon size={32} />
              </div>
              <h3 className="feature-title">Discover New APIs</h3>
              <p className="feature-description">
                Explore a curated list of popular and niche APIs you might not have known about.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <RocketIcon size={32} />
              </div>
              <h3 className="feature-title">Build Faster</h3>
              <p className="feature-description">
                Focus on building, not on endless brainstorming. Get your project off the ground in minutes.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isLoading && (
        <section className="cta-section">
          <h2 className="cta-title">Ready to Build Your Masterpiece?</h2>
          <p className="cta-description">
            Stop waiting for inspiration to strike. Generate your first idea now and see where it takes you.
          </p>
          <button className="hero-cta" onClick={handleGenerate}>
            Start Your Hackathon Journey
          </button>
        </section>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <a href="#terms" className="footer-link">Terms of Service</a>
          </div>
          <div className="footer-social">
            <a href="#twitter" className="social-link">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#github" className="social-link">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="#linkedin" className="social-link">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
          <p className="footer-copyright">© 2024 API Roulette. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
