import React from 'react';
import { AppIdea } from '../types';
import './IdeaDisplay.css';

interface IdeaDisplayProps {
  idea: AppIdea;
}

const IdeaDisplay: React.FC<IdeaDisplayProps> = ({ idea }) => {
  return (
    <div className="idea-display">
      <h2 className="idea-title">{idea.appName}</h2>
      <p className="idea-description">{idea.description}</p>
      
      <div className="idea-section">
        <h3 className="section-title">Key Features</h3>
        <ul className="features-list">
          {idea.features.map((feature, index) => (
            <li key={index} className="feature-item">{feature}</li>
          ))}
        </ul>
      </div>

      <div className="idea-section">
        <h3 className="section-title">Why This Works</h3>
        <p className="idea-rationale">{idea.rationale}</p>
      </div>
    </div>
  );
};

export default IdeaDisplay;
