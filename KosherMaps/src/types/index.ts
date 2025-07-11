export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  types?: string[];
}

export interface Address {
  formattedAddress: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Route {
  id: string;
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps: RouteStep[];
  bounds: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: Coordinates;
  endLocation: Coordinates;
  maneuver?: string;
}

export interface NavigationState {
  isNavigating: boolean;
  currentRoute?: Route;
  currentStep?: RouteStep;
  remainingDistance: number;
  remainingTime: number;
  currentLocation?: Coordinates;
}

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export type TransportMode = 'driving' | 'walking' | 'cycling' | 'transit';

export interface SearchHistoryItem {
  id: string;
  query: string;
  place?: Place;
  timestamp: Date;
}

export interface UserPreferences {
  transportMode: TransportMode;
  avoidTolls: boolean;
  avoidHighways: boolean;
  voiceGuidance: boolean;
  units: 'metric' | 'imperial';
}