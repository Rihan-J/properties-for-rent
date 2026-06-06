/**
 * SearchBar — Location search component for map.
 * Adapted from frontend/src/components/map/SearchBar.js
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';

export default function SearchBar({ onLocationSelect, onClear, disabled }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5&countrycodes=in` // Constrained to India, similar to web
        );
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const name = item.display_name.split(',')[0];
    
    setQuery(name);
    setShowResults(false);
    Keyboard.dismiss();
    
    if (onLocationSelect) {
      onLocationSelect({ lat, lng, name });
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    Keyboard.dismiss();
    if (onClear) onClear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search locations..."
          placeholderTextColor={colors.textPlaceholder}
          value={query}
          onChangeText={setQuery}
          editable={!disabled}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {isSearching ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.rightIcon} />
        ) : query ? (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
            <Text style={styles.clearIcon}>✖</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.resultIcon}>📍</Text>
                <Text style={styles.resultText} numberOfLines={2}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // Below status bar
    left: spacing.base,
    right: spacing.base,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
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
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  resultText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
