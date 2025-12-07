import React, { useState, useEffect, useRef } from 'react';
import { CompassIcon } from './Icons';
import './CustomGenerateButton.css';

interface API {
  id: string;
  name: string;
  description: string;
  category: string;
  authType: string;
}

interface CustomGenerateButtonProps {
  onGenerate: (apiIds: string[]) => void;
}

export const CustomGenerateButton: React.FC<CustomGenerateButtonProps> = ({ onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [apis, setApis] = useState<API[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAPIs();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    setIsOpen(false);
    setSelectedAPIs([]);
  };

  const getSelectedAPIsData = () => {
    return apis.filter(api => selectedAPIs.includes(api.id));
  };

  const getAvailableAPIs = () => {
    return apis.filter(api => !selectedAPIs.includes(api.id)).slice(0, 20);
  };

  return (
    <div className="custom-generate-dropdown" ref={dropdownRef}>
      <button 
        className="custom-generate-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CompassIcon size={18} />
        Choose APIs
      </button>

      {isOpen && (
        <div className="custom-generate-panel">
          <div className="panel-header">
            <h3>Select APIs</h3>
            <span className="selection-badge">
              {selectedAPIs.length} / 3
            </span>
          </div>

          {/* Selected APIs Section */}
          {selectedAPIs.length > 0 && (
            <div className="selected-apis-section">
              <div className="selected-label">Selected APIs:</div>
              <div className="selected-apis-list">
                {getSelectedAPIsData().map(api => (
                  <div
                    key={api.id}
                    className="selected-api-chip"
                    onClick={() => toggleAPISelection(api.id)}
                  >
                    <span className="chip-name">{api.name}</span>
                    <span className="chip-remove">×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel-controls">
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="api-list-dropdown">
            {loading ? (
              <div className="loading-text">Loading...</div>
            ) : getAvailableAPIs().length === 0 ? (
              <div className="empty-text">
                {selectedAPIs.length === 3 ? 'Maximum 3 APIs selected' : 'No APIs found'}
              </div>
            ) : (
              getAvailableAPIs().map(api => (
                <div
                  key={api.id}
                  className={`api-item-dropdown ${selectedAPIs.length >= 3 ? 'disabled' : ''}`}
                  onClick={() => toggleAPISelection(api.id)}
                >
                  <div className="api-item-content">
                    <div className="api-item-name">{api.name}</div>
                    <div className="api-item-category">{api.category}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedAPIs.length > 0 && (
            <div className="panel-footer">
              <button 
                className="generate-btn-dropdown"
                onClick={handleGenerate}
              >
                Generate Mashup ({selectedAPIs.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
