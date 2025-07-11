import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Place, SearchHistoryItem, Coordinates } from '../../types';
import { PlacesService } from '../../services/places';
import { COLORS, SEARCH_CONFIG } from '../../utils/constants';

interface SearchBarProps {
  onPlaceSelected: (place: Place) => void;
  onLocationSelected: (coordinates: Coordinates) => void;
  placeholder?: string;
  userLocation?: Coordinates;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onPlaceSelected,
  onLocationSelected,
  placeholder = 'Search for places...',
  userLocation,
  style,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await PlacesService.initialize();
        loadSearchHistory();
      } catch (error) {
        console.error('Search history initialization error:', error);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const handleSearch = () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await PlacesService.searchPlaces(
            query,
            userLocation,
            SEARCH_CONFIG.SEARCH_RADIUS
          );
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, SEARCH_CONFIG.DEBOUNCE_DELAY);
    };
    
    if (query.trim().length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      if (isFocused) {
        loadSearchHistory();
      }
    }
  }, [query, userLocation, isFocused]);


  const loadSearchHistory = () => {
    const history = PlacesService.getSearchHistory();
    setSearchHistory(history);
  };


  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    if (query.trim().length < 2) {
      loadSearchHistory();
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for item selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handlePlaceSelection = async (place: Place) => {
    try {
      // Get full place details if needed
      let fullPlace = place;
      if (place.coordinates.latitude === 0 && place.coordinates.longitude === 0) {
        fullPlace = await PlacesService.getPlaceDetails(place.id);
      }

      setQuery(fullPlace.name);
      setShowSuggestions(false);
      setSearchResults([]);
      
      // Add to search history
      await PlacesService.addToSearchHistory(fullPlace.name, fullPlace);
      
      onPlaceSelected(fullPlace);
      onLocationSelected(fullPlace.coordinates);
      
      Keyboard.dismiss();
    } catch (error) {
      console.error('Place selection error:', error);
    }
  };

  const handleHistoryItemSelection = (item: SearchHistoryItem) => {
    setQuery(item.query);
    setShowSuggestions(false);
    
    if (item.place) {
      onPlaceSelected(item.place);
      onLocationSelected(item.place.coordinates);
    }
    
    Keyboard.dismiss();
  };

  const handleClearInput = () => {
    setQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const handleClearHistory = async () => {
    try {
      await PlacesService.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  const renderSearchResult = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handlePlaceSelection(item)}
    >
      <Icon name="place" size={20} color={COLORS.TEXT_SECONDARY} style={styles.suggestionIcon} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.suggestionSubtitle} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleHistoryItemSelection(item)}
    >
      <Icon name="history" size={20} color={COLORS.TEXT_SECONDARY} style={styles.suggestionIcon} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.query}
        </Text>
        {item.place && (
          <Text style={styles.suggestionSubtitle} numberOfLines={1}>
            {item.place.address}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={async () => {
          await PlacesService.removeFromSearchHistory(item.id);
          loadSearchHistory();
        }}
        style={styles.removeButton}
      >
        <Icon name="close" size={16} color={COLORS.TEXT_SECONDARY} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const showSearchResults = query.trim().length >= 2 && searchResults.length > 0;
  const showHistory = query.trim().length < 2 && searchHistory.length > 0 && isFocused;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Icon name="search" size={24} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={query}
          onChangeText={setQuery}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
            <Icon name="close" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
        {isLoading && (
          <ActivityIndicator size="small" color={COLORS.PRIMARY} style={styles.loadingIndicator} />
        )}
      </View>

      {showSuggestions && (showSearchResults || showHistory) && (
        <View style={styles.suggestionsContainer}>
          {showSearchResults && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}

          {showHistory && (
            <>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={handleClearHistory}>
                  <Text style={styles.clearHistoryText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={searchHistory}
                keyExtractor={(item) => item.id}
                renderItem={renderHistoryItem}
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 300,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  clearHistoryText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
  },
});