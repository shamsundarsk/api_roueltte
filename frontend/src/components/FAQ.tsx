import React, { useState } from 'react';
import { useMashup } from '../context/MashupContext';
import { PackageIcon, KeyIcon, BugIcon, ClipboardIcon, CodeIcon } from './Icons';
import './FAQ.css';

interface FAQProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export const FAQ: React.FC<FAQProps> = ({ isOpen, onClose, inline = false }) => {
  const { mashupData } = useMashup();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!isOpen && !inline) return null;

  const faqCategories = [
    {
      id: 'setup',
      title: 'Setup Guide',
      icon: <PackageIcon size={20} />,
      content: (
        <div className="faq-content">
          <h4>Getting Started</h4>
          <ol>
            <li>Download and extract the ZIP file</li>
            <li>Open the folder in Kiro IDE</li>
            <li>Run <code>npm install</code> in the terminal</li>
            <li>Configure your API keys in the <code>.env</code> file</li>
            <li>Start the development server with <code>npm run dev</code></li>
          </ol>
          <p><strong>Note:</strong> Make sure you have Node.js installed on your system.</p>
        </div>
      )
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      icon: <KeyIcon size={20} />,
      content: (
        <div className="faq-content">
          <h4>How to Get API Keys</h4>
          {mashupData && (
            <ul>
              {mashupData.idea.apis.map((api, index) => (
                <li key={index}>
                  <strong>{api.name}:</strong> Visit{' '}
                  <a href={api.documentationUrl} target="_blank" rel="noopener noreferrer">
                    {api.documentationUrl}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p><strong>Important:</strong> Never commit your API keys to version control. Keep them in your <code>.env</code> file.</p>
        </div>
      )
    },
    {
      id: 'errors',
      title: 'Common Errors',
      icon: <BugIcon size={20} />,
      content: (
        <div className="faq-content">
          <h4>Troubleshooting</h4>
          <div className="error-item">
            <strong>Module not found:</strong>
            <p>Run <code>npm install</code> to install all dependencies.</p>
          </div>
          <div className="error-item">
            <strong>API request failed:</strong>
            <p>Check that your API keys are correctly set in the <code>.env</code> file.</p>
          </div>
          <div className="error-item">
            <strong>Port already in use:</strong>
            <p>Change the port in your configuration or stop the process using that port.</p>
          </div>
          <div className="error-item">
            <strong>CORS errors:</strong>
            <p>Make sure you're using the backend proxy for API calls, not direct requests from the frontend.</p>
          </div>
        </div>
      )
    },
    {
      id: 'structure',
      title: 'Project Structure',
      icon: <ClipboardIcon size={20} />,
      content: (
        <div className="faq-content">
          <h4>Understanding the Project</h4>
          <div className="structure-item">
            <code>/backend</code> - Express.js server with API routes
          </div>
          <div className="structure-item">
            <code>/frontend</code> - React application with UI components
          </div>
          <div className="structure-item">
            <code>/.env</code> - Environment variables (API keys)
          </div>
          <div className="structure-item">
            <code>/README.md</code> - Detailed project documentation
          </div>
          <p><strong>Tip:</strong> Start by reading the README.md file for a complete overview.</p>
        </div>
      )
    },
    {
      id: 'development',
      title: 'Development Tips',
      icon: <CodeIcon size={20} />,
      content: (
        <div className="faq-content">
          <h4>Best Practices</h4>
          <ul>
            <li>Use the included ESLint configuration for code quality</li>
            <li>Test API endpoints individually before integrating</li>
            <li>Check the browser console for frontend errors</li>
            <li>Use the Network tab to debug API requests</li>
            <li>Read each API's documentation for rate limits and usage</li>
          </ul>
          <p><strong>Pro Tip:</strong> Use Kiro's built-in debugging tools to step through your code.</p>
        </div>
      )
    }
  ];

  const faqContent = (
    <>
      {mashupData && !inline && (
        <div className="faq-project-info">
          <h3>Your Project: {mashupData.idea.appName}</h3>
          <p>{mashupData.idea.description}</p>
        </div>
      )}

      <div className="faq-categories">
        {faqCategories.map((category) => (
          <div key={category.id} className="faq-category">
            <button
              className={`faq-category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-title">{category.title}</span>
              <span className="category-arrow">{activeCategory === category.id ? '▼' : '▶'}</span>
            </button>
            {activeCategory === category.id && (
              <div className="faq-category-content">
                {category.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  if (inline) {
    return <div className="faq-body">{faqContent}</div>;
  }

  return (
    <div className="faq-overlay" onClick={onClose}>
      <div className="faq-container" onClick={(e) => e.stopPropagation()}>
        <div className="faq-header">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <button className="faq-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="faq-body">
          {faqContent}
        </div>
      </div>
    </div>
  );
};
