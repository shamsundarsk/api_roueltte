import React from 'react';
import { UILayout } from '../types';
import { PaletteIcon, MonitorIcon } from './Icons';
import './UILayoutDisplay.css';

interface UILayoutDisplayProps {
  uiLayout: UILayout;
}

const UILayoutDisplay: React.FC<UILayoutDisplayProps> = ({ uiLayout }) => {
  return (
    <div className="ui-layout-display">
      <h3 className="layout-title">
        <span className="layout-title-icon">
          <PaletteIcon size={28} />
        </span>
        UI Layout Suggestions
      </h3>

      <div className="layout-section">
        <h4 className="layout-section-title">Recommended Screens</h4>
        <div className="screens-grid">
          {uiLayout.screens.map((screen, index) => (
            <div key={index} className="screen-card">
              <h5 className="screen-name">
                <span className="screen-name-icon">
                  <MonitorIcon size={20} />
                </span>
                {screen.name}
              </h5>
              <p className="screen-description">{screen.description}</p>
              <div className="screen-components">
                <span className="components-label">Components:</span>
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

      <div className="layout-section">
        <h4 className="layout-section-title">Component Suggestions</h4>
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

      <div className="layout-section">
        <h4 className="layout-section-title">Interaction Flow</h4>
        <div className="flow-container">
          {uiLayout.interactionFlow.steps.map((step, index) => (
            <div key={index} className="flow-step">
              <div className="flow-from">{step.from}</div>
              <div className="flow-arrow">
                <span className="arrow-label">{step.action}</span>
                <span className="arrow-icon">→</span>
              </div>
              <div className="flow-to">{step.to}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UILayoutDisplay;
