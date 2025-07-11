import { TransportMode } from '../types';

export const GOOGLE_MAPS_CONFIG = {
  DEFAULT_ZOOM: 15,
  DEFAULT_LOCATION: {
    latitude: 37.7749,
    longitude: -122.4194, // San Francisco default
  },
  SEARCH_RADIUS: 50000, // 50km in meters
  AUTOCOMPLETE_DELAY: 300, // ms
};

export const PERMISSIONS = {
  LOCATION: {
    PRECISE: 'android.permission.ACCESS_FINE_LOCATION',
    COARSE: 'android.permission.ACCESS_COARSE_LOCATION',
    BACKGROUND: 'android.permission.ACCESS_BACKGROUND_LOCATION',
  },
  IOS: {
    LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
  },
};

export const TRANSPORT_MODES: Record<TransportMode, { name: string; icon: string }> = {
  driving: { name: 'Driving', icon: 'car' },
  walking: { name: 'Walking', icon: 'walk' },
  cycling: { name: 'Cycling', icon: 'bicycle' },
  transit: { name: 'Transit', icon: 'train' },
};

export const COLORS = {
  PRIMARY: '#4285F4',
  SECONDARY: '#34A853',
  ACCENT: '#FBBC04',
  ERROR: '#EA4335',
  WARNING: '#FF9800',
  SUCCESS: '#4CAF50',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F5F5F5',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  BORDER: '#E0E0E0',
};

export const NAVIGATION_COLORS = {
  ROUTE_ACTIVE: '#4285F4',
  ROUTE_ALTERNATIVE: '#9E9E9E',
  CURRENT_LOCATION: '#4285F4',
  DESTINATION: '#EA4335',
};

export const SEARCH_CONFIG = {
  MAX_HISTORY_ITEMS: 10,
  MAX_FAVORITES: 50,
  DEBOUNCE_DELAY: 300,
  SEARCH_RADIUS: 50000, // 50km in meters
};

export const API_ENDPOINTS = {
  PLACES_AUTOCOMPLETE: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  PLACES_DETAILS: 'https://maps.googleapis.com/maps/api/place/details/json',
  GEOCODING: 'https://maps.googleapis.com/maps/api/geocode/json',
  DIRECTIONS: 'https://maps.googleapis.com/maps/api/directions/json',
};