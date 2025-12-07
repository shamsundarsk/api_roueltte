import React, { useState, useEffect } from 'react';
import { SearchIcon, CheckCircleIcon } from './Icons';
import './APISelector.css';

interface API {
  id: string;
  name: string;
  description: string;
  category: string;
  authType: string;
  corsCompatible: boolean;
  documentationUrl: string;
}

interface APISelectorProps {
  onGenerate: (apiIds: string[]) => void;
}

export const APISelector: React.FC<APISelectorProps> = ({ onGenerate }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [apis, setApis] = useState<API[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchAPIs();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/registry/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAPIs = async (category?: string) => {
    setLoading(true);
    try {
      const url = category && category !== 'all' 
        ? `/api/registry/apis?category=${category}`
        : '/api/registry/apis';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setApis(data.data.apis);
      }
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchAPIs(category);
  };

  const toggleAPISelection = (apiId: string) => {
    setSelectedAPIs(prev => {
      if (prev.includes(apiId)) {
        return prev.filter(id => id !== apiId);
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, apiId];
      }
    });
  };

  const handleGenerate = () => {
    if (selectedAPIs.length === 0) {
      return;
    }
    onGenerate(selectedAPIs);
    setSelectedAPIs([]);
  };

  const filteredAPIs = apis.filter(api =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="api-selector-inline">
      <div className="api-selector-header-inline">
        <h2 className="api-selector-title">Choose Your APIs</h2>
        <p className="api-selector-subtitle">
          Select up to 3 APIs to create your custom mashup
        </p>
      </div>

      <div className="api-selector-controls-inline">
        <div className="search-box-inline">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-inline">
          <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="selection-info">
          <span className="selection-counter">
            {selectedAPIs.length} / 3 Selected
          </span>
          {selectedAPIs.length > 0 && (
            <button className="clear-selection" onClick={() => setSelectedAPIs([])}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="api-grid-inline">
        {loading ? (
          <div className="loading-state-inline">Loading APIs...</div>
        ) : filteredAPIs.length === 0 ? (
          <div className="empty-state-inline">No APIs found</div>
        ) : (
          filteredAPIs.map(api => (
            <div
              key={api.id}
              className={`api-card-inline ${selectedAPIs.includes(api.id) ? 'selected' : ''} ${selectedAPIs.length >= 3 && !selectedAPIs.includes(api.id) ? 'disabled' : ''}`}
              onClick={() => toggleAPISelection(api.id)}
            >
              {selectedAPIs.includes(api.id) && (
                <div className="api-card-selected-badge">
                  <CheckCircleIcon size={24} />
                </div>
              )}
              <div className="api-card-content">
                <h3 className="api-card-name">{api.name}</h3>
                <p className="api-card-description">{api.description}</p>
                <div className="api-card-meta">
                  <span className="api-badge category">{api.category}</span>
                  <span className={`api-badge auth ${api.authType}`}>
                    {api.authType === 'none' ? 'No Auth' : api.authType.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAPIs.length > 0 && (
        <div className="api-selector-action">
          <button 
            className="generate-custom-btn" 
            onClick={handleGenerate}
          >
            Generate Custom Mashup ({selectedAPIs.length} API{selectedAPIs.length !== 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  );
};
