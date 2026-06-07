/**
 * SearchBar — Location search with Nominatim geocoding.
 * Exactly mirrors frontend/src/components/map/SearchBar.js
 * Debounced input, dropdown results, keyboard submit.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';

export default function SearchBar({ onLocationSelect, onClear, disabled = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Debounced geocoding search with AbortController (exact web match)
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
            'User-Agent': 'PropertiesForRentMobileApp/1.0',
          },
          signal: controller.signal,
        }
      );
      
      // Read as text first to handle HTML error responses
      const text = await response.text();
      if (text.startsWith('<') || text.includes('Access denied')) {
        console.error('[SearchBar] Nominatim blocked request');
        return;
      }
      
      const data = JSON.parse(text);
      if (!controller.signal.aborted) {
        setResults(data);
        setIsOpen(data.length > 0);
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

  // Debounce input — 500ms (exact web match)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchLocation(query);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchLocation]);

  // Exact web handleSelect
  function handleSelect(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const displayName = result.display_name.split(',').slice(0, 3).join(', ');
    setQuery(displayName);
    setIsOpen(false);
    setResults([]);
    Keyboard.dismiss();
    onLocationSelect({ lat, lng, name: displayName });
  }

  // Exact web handleClear
  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    Keyboard.dismiss();
    onClear?.();
  }

  // Exact web formatResult
  function formatResult(result) {
    const parts = result.display_name.split(', ');
    const primary = parts.slice(0, 2).join(', ');
    const secondary = parts.slice(2, 4).join(', ');
    return { primary, secondary };
  }

  // Submit on Enter key — selects first result
  function handleSubmit() {
    if (results && results.length > 0) {
      handleSelect(results[0]);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, isOpen && styles.inputContainerActive]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search city, area, or location..."
          placeholderTextColor={colors.textPlaceholder}
          value={query}
          onChangeText={setQuery}
          editable={!disabled}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {/* Loading spinner (exact web match) */}
        {loading && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.rightIcon} />
        )}
        {/* Clear button (exact web match) */}
        {query && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <Text style={styles.clearIcon}>❌</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results dropdown (exact web match) */}
      {isOpen && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {results.map((item, index) => {
              const { primary, secondary } = formatResult(item);
              return (
                <View key={item.place_id.toString()}>
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.resultIcon}>📍</Text>
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultPrimaryText} numberOfLines={1}>
                        {primary}
                      </Text>
                      {secondary && (
                        <Text style={styles.resultSecondaryText} numberOfLines={1}>
                          {secondary}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {index < results.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainerActive: {
    borderColor: colors.accent,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  rightIcon: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 8,
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },
  resultTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultPrimaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  resultSecondaryText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 40,
  },
});
