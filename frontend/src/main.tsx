import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MashupProvider } from './context';
import { validateEnv } from './utils/validateEnv';
import './styles/reset.css';
import './styles/design-tokens.css';
import './styles/utilities.css';
import './styles/components.css';
import './index.css';

// Validate environment variables on startup
try {
  validateEnv();
  console.log('✓ Environment variables validated successfully');
} catch (error) {
  console.error('✗ Environment validation failed:');
  console.error((error as Error).message);
  // In development, show error in UI
  if (import.meta.env.DEV) {
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h2>Environment Configuration Error</h2>
        <pre>${(error as Error).message}</pre>
        <p>Please check your .env file and ensure all required variables are set.</p>
      </div>
    `;
  }
  throw error;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MashupProvider>
      <App />
    </MashupProvider>
  </React.StrictMode>
);
