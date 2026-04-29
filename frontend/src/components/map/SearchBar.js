'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Location search bar with Nominatim geocoding.
 * Debounced input, dropdown results, keyboard navigation.
 */
export default function SearchBar({ onLocationSelect, onClear, disabled = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Debounced geocoding search with AbortController to cancel stale requests
  const searchLocation = useCallback(async (searchQuery) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();

    if (!searchQuery || searchQuery.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
          signal: controller.signal,
        }
      );
      const data = await response.json();
      if (!controller.signal.aborted) {
        setResults(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Debounce input — 500ms to prevent per-keystroke API calls
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchLocation(query);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchLocation]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const displayName = result.display_name.split(',').slice(0, 3).join(', ');
    setQuery(displayName);
    setIsOpen(false);
    setResults([]);
    onLocationSelect({ lat, lng, name: displayName });
  }

  function handleKeyDown(e) {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
    onClear?.();
  }

  // Format display name to show city/area more prominently
  function formatResult(result) {
    const parts = result.display_name.split(', ');
    const primary = parts.slice(0, 2).join(', ');
    const secondary = parts.slice(2, 4).join(', ');
    return { primary, secondary };
  }

  return (
    <div ref={containerRef} className="apna-search-container">
      <div className={`apna-search-input-wrap ${isOpen ? 'apna-search-active' : ''}`}>
        {/* Search icon */}
        <svg
          className="apna-search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search city, area, or location..."
          disabled={disabled}
          className="apna-search-input"
          autoComplete="off"
          id="map-search-input"
        />

        {/* Loading spinner */}
        {loading && (
          <div className="apna-search-spinner">
            <div className="apna-spinner" />
          </div>
        )}

        {/* Clear button */}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="apna-search-clear"
            type="button"
            aria-label="Clear search"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="apna-search-dropdown">
          {results.map((result, index) => {
            const { primary, secondary } = formatResult(result);
            return (
              <button
                key={result.place_id}
                onClick={() => handleSelect(result)}
                className={`apna-search-result ${index === activeIndex ? 'apna-search-result-active' : ''}`}
                type="button"
              >
                <div className="apna-search-result-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="apna-search-result-text">
                  <span className="apna-search-result-primary">{primary}</span>
                  {secondary && (
                    <span className="apna-search-result-secondary">{secondary}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
