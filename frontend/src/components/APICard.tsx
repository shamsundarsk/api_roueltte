import React from 'react';
import { APIMetadata } from '../types';
import './APICard.css';

interface APICardProps {
  api: APIMetadata;
}

const APICard: React.FC<APICardProps> = ({ api }) => {
  return (
    <div className="api-card">
      <div className="api-card-header">
        <h3 className="api-name">{api.name}</h3>
        <span className="api-category">{api.category}</span>
      </div>
      <p className="api-description">{api.description}</p>
      <div className="api-metadata">
        <div className="metadata-item">
          <span className="metadata-label">Auth:</span>
          <span className="metadata-value">{api.authType}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">CORS:</span>
          <span className="metadata-value">{api.corsCompatible ? 'Yes' : 'No'}</span>
        </div>
      </div>
      <a
        href={api.documentationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="api-docs-link"
      >
        View Documentation →
      </a>
    </div>
  );
};

export default APICard;
