import { Coordinates, Route, NavigationState, TransportMode } from '../types';
import { GoogleMapsService } from './googleMaps';

export class TempNavigationService {
  private static currentRoute: Route | null = null;
  private static navigationState: NavigationState = {
    isNavigating: false,
    remainingDistance: 0,
    remainingTime: 0,
  };
  private static listeners: Set<(state: NavigationState) => void> = new Set();

  static addListener(callback: (state: NavigationState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(callback => callback({ ...this.navigationState }));
  }

  static async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
    mode: TransportMode = 'driving'
  ): Promise<Route[]> {
    try {
      const mappedMode = this.mapTransportMode(mode);
      const routes = await GoogleMapsService.getDirections(origin, destination, mappedMode);
      return routes;
    } catch (error) {
      console.error('Route calculation error:', error);
      throw error;
    }
  }

  private static mapTransportMode(mode: TransportMode): 'driving' | 'walking' | 'bicycling' | 'transit' {
    switch (mode) {
      case 'driving':
        return 'driving';
      case 'walking':
        return 'walking';
      case 'cycling':
        return 'bicycling';
      case 'transit':
        return 'transit';
      default:
        return 'driving';
    }
  }

  static async startNavigation(
    destination: Coordinates,
    mode: TransportMode = 'driving'
  ): Promise<void> {
    try {
      // Get current location
      const currentLocation = await GoogleMapsService.getCurrentLocation();
      
      // Calculate route
      const routes = await this.calculateRoute(currentLocation, destination, mode);
      if (routes.length === 0) {
        throw new Error('No route found to destination');
      }

      // Use the first route
      const selectedRoute = routes[0];
      this.currentRoute = selectedRoute;

      // Update navigation state
      this.navigationState = {
        isNavigating: true,
        currentRoute: selectedRoute,
        currentStep: selectedRoute.steps[0],
        remainingDistance: selectedRoute.distance,
        remainingTime: selectedRoute.duration,
        currentLocation,
      };

      this.notifyListeners();
      console.log('Navigation started (mock mode)');
      
    } catch (error) {
      console.error('Navigation start error:', error);
      throw error;
    }
  }

  static async stopNavigation(): Promise<void> {
    try {
      this.currentRoute = null;
      this.navigationState = {
        isNavigating: false,
        remainingDistance: 0,
        remainingTime: 0,
      };

      this.notifyListeners();
      console.log('Navigation stopped');
    } catch (error) {
      console.error('Navigation stop error:', error);
      throw error;
    }
  }

  static getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  static getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  static async recalculateRoute(): Promise<void> {
    if (!this.navigationState.isNavigating || !this.currentRoute) {
      throw new Error('No active navigation to recalculate');
    }

    try {
      const currentLocation = await GoogleMapsService.getCurrentLocation();
      const destination = this.currentRoute.steps[this.currentRoute.steps.length - 1].endLocation;
      
      const routes = await this.calculateRoute(currentLocation, destination);
      if (routes.length > 0) {
        this.currentRoute = routes[0];
        this.navigationState.currentRoute = routes[0];
        this.navigationState.remainingDistance = routes[0].distance;
        this.navigationState.remainingTime = routes[0].duration;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Route recalculation error:', error);
      throw error;
    }
  }

  static async setVoiceGuidance(enabled: boolean): Promise<void> {
    console.log(`Voice guidance ${enabled ? 'enabled' : 'disabled'} (mock)`);
  }

  static async showRouteOverview(): Promise<void> {
    console.log('Show route overview (mock)');
  }

  static async continueToNextDestination(): Promise<void> {
    console.log('Continue to next destination (mock)');
  }

  static formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  }

  static formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes} min`;
    }
  }
}