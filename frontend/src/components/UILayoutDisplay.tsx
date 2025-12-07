import React, { useState } from 'react';
import { UILayout } from '../types';
import { MonitorIcon, CodeIcon, ZapIcon } from './Icons';
import './UILayoutDisplay.css';

interface UILayoutDisplayProps {
  uiLayout: UILayout;
}

const UILayoutDisplay: React.FC<UILayoutDisplayProps> = ({ uiLayout }) => {
  const [activeTab, setActiveTab] = useState<'screens' | 'components' | 'flow'>('screens');

  return (
    <div className="ui-layout-display">
      {/* Tab Navigation */}
      <div className="layout-tabs">
        <button
          className={`layout-tab ${activeTab === 'screens' ? 'active' : ''}`}
          onClick={() => setActiveTab('screens')}
        >
          <MonitorIcon size={18} />
          <span>Screens</span>
          <span className="tab-count">{uiLayout.screens.length}</span>
        </button>
        <button
          className={`layout-tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          <CodeIcon size={18} />
          <span>Components</span>
          <span className="tab-count">{uiLayout.components.length}</span>
        </button>
        <button
          className={`layout-tab ${activeTab === 'flow' ? 'active' : ''}`}
          onClick={() => setActiveTab('flow')}
        >
          <ZapIcon size={18} />
          <span>User Flow</span>
          <span className="tab-count">{uiLayout.interactionFlow.steps.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="layout-content">
        {activeTab === 'screens' && (
          <div className="tab-panel">
            <div className="screens-grid">
              {uiLayout.screens.map((screen, index) => (
                <div key={index} className="screen-card">
                  <div className="screen-header">
                    <div className="screen-icon">
                      <MonitorIcon size={20} color="white" />
                    </div>
                    <h5 className="screen-name">{screen.name}</h5>
                  </div>
                  <p className="screen-description">{screen.description}</p>
                  <div className="screen-components">
                    <span className="components-label">UI Components</span>
                    <div className="components-list">
                      {screen.components.map((component, idx) => (
                        <span key={idx} className="component-tag">{component}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="tab-panel">
            <div className="components-grid">
              {uiLayout.components.map((component, index) => (
                <div key={index} className="component-card">
                  <div className="component-header">
                    <span className="component-type">{component.type}</span>
                    <span className="component-api">{component.apiSource}</span>
                  </div>
                  <p className="component-purpose">{component.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="tab-panel">
            <div className="flow-container">
              {uiLayout.interactionFlow.steps.map((step, index) => (
                <div key={index} className="flow-step">
                  <div className="flow-number">{index + 1}</div>
                  <div className="flow-content">
                    <div className="flow-from">{step.from}</div>
                    <div className="flow-action">
                      <ZapIcon size={16} color="#2ecc70" />
                      <span>{step.action}</span>
                    </div>
                    <div className="flow-to">{step.to}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UILayoutDisplay;
