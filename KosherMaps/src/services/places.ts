import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleMapsService } from './googleMaps';
import { Place, Coordinates, SearchHistoryItem } from '../types';
import { SEARCH_CONFIG } from '../utils/constants';

export class PlacesService {
  private static readonly SEARCH_HISTORY_KEY = 'search_history';
  private static readonly FAVORITES_KEY = 'favorites';
  
  private static searchHistory: SearchHistoryItem[] = [];
  private static favorites: Place[] = [];

  static async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadSearchHistory(),
        this.loadFavorites(),
      ]);
    } catch (error) {
      console.error('Places service initialization error:', error);
    }
  }

  private static async loadSearchHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (stored) {
        this.searchHistory = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      this.searchHistory = [];
    }
  }

  private static async saveSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.SEARCH_HISTORY_KEY,
        JSON.stringify(this.searchHistory)
      );
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  private static async loadFavorites(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.FAVORITES_KEY);
      if (stored) {
        this.favorites = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
    }
  }

  private static async saveFavorites(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.FAVORITES_KEY,
        JSON.stringify(this.favorites)
      );
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  static async searchPlaces(
    query: string,
    location?: Coordinates,
    radius?: number
  ): Promise<Place[]> {
    try {
      if (query.trim().length < 2) {
        return [];
      }

      const places = await GoogleMapsService.searchPlaces(query, location, radius);
      
      // Add to search history
      await this.addToSearchHistory(query);
      
      return places;
    } catch (error) {
      console.error('Places search error:', error);
      throw error;
    }
  }

  static async getPlaceDetails(placeId: string): Promise<Place> {
    try {
      return await GoogleMapsService.getPlaceDetails(placeId);
    } catch (error) {
      console.error('Get place details error:', error);
      throw error;
    }
  }

  static async addToSearchHistory(query: string, place?: Place): Promise<void> {
    try {
      // Remove existing entry with same query
      this.searchHistory = this.searchHistory.filter(
        item => item.query.toLowerCase() !== query.toLowerCase()
      );

      // Add new entry at the beginning
      this.searchHistory.unshift({
        id: `search_${Date.now()}`,
        query,
        place,
        timestamp: new Date(),
      });

      // Limit history size
      if (this.searchHistory.length > SEARCH_CONFIG.MAX_HISTORY_ITEMS) {
        this.searchHistory = this.searchHistory.slice(0, SEARCH_CONFIG.MAX_HISTORY_ITEMS);
      }

      await this.saveSearchHistory();
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  static getSearchHistory(): SearchHistoryItem[] {
    return [...this.searchHistory];
  }

  static async clearSearchHistory(): Promise<void> {
    try {
      this.searchHistory = [];
      await AsyncStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  static async removeFromSearchHistory(itemId: string): Promise<void> {
    try {
      this.searchHistory = this.searchHistory.filter(item => item.id !== itemId);
      await this.saveSearchHistory();
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  static async addToFavorites(place: Place): Promise<void> {
    try {
      // Check if already in favorites
      const exists = this.favorites.some(fav => fav.id === place.id);
      if (exists) {
        throw new Error('Place is already in favorites');
      }

      // Check favorites limit
      if (this.favorites.length >= SEARCH_CONFIG.MAX_FAVORITES) {
        throw new Error('Maximum number of favorites reached');
      }

      this.favorites.push(place);
      await this.saveFavorites();
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(placeId: string): Promise<void> {
    try {
      this.favorites = this.favorites.filter(place => place.id !== placeId);
      await this.saveFavorites();
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  static getFavorites(): Place[] {
    return [...this.favorites];
  }

  static isFavorite(placeId: string): boolean {
    return this.favorites.some(place => place.id === placeId);
  }

  static async nearbySearch(
    location: Coordinates,
    type: string = 'establishment',
    radius: number = 5000
  ): Promise<Place[]> {
    try {
      // This would use Google Places Nearby Search API
      // For now, we'll use the text search with a type filter
      return await GoogleMapsService.searchPlaces(type, location, radius);
    } catch (error) {
      console.error('Nearby search error:', error);
      throw error;
    }
  }

  static async geocodePlace(address: string): Promise<Coordinates> {
    try {
      return await GoogleMapsService.geocode(address);
    } catch (error) {
      console.error('Geocode place error:', error);
      throw error;
    }
  }

  static async reverseGeocodeLocation(coordinates: Coordinates): Promise<string> {
    try {
      const address = await GoogleMapsService.reverseGeocode(coordinates);
      return address.formattedAddress;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      throw error;
    }
  }

  static getSearchSuggestions(query: string): SearchHistoryItem[] {
    if (!query.trim()) {
      return this.searchHistory.slice(0, 5);
    }

    return this.searchHistory
      .filter(item => 
        item.query.toLowerCase().includes(query.toLowerCase()) ||
        item.place?.name.toLowerCase().includes(query.toLowerCase()) ||
        item.place?.address.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }

  static getPopularPlaces(): Place[] {
    // Return favorites sorted by usage (for now, just return all favorites)
    return this.favorites.slice(0, 5);
  }

  static async searchByCategory(
    category: string,
    location?: Coordinates,
    radius?: number
  ): Promise<Place[]> {
    try {
      const categoryQueries: Record<string, string> = {
        restaurants: 'restaurant',
        gas_stations: 'gas station',
        hospitals: 'hospital',
        hotels: 'hotel',
        banks: 'bank',
        shopping: 'shopping mall',
        parking: 'parking',
        attractions: 'tourist attraction',
      };

      const query = categoryQueries[category] || category;
      return await this.searchPlaces(query, location, radius);
    } catch (error) {
      console.error('Category search error:', error);
      throw error;
    }
  }
}