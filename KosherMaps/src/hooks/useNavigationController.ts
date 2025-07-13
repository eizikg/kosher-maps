import { useEffect, useState } from 'react';
import { useNavigation } from '@googlemaps/react-native-navigation-sdk';
import { Coordinates, Route, NavigationState, TransportMode } from '../types';
import { GoogleMapsService } from '../services/googleMaps';

export const useNavigationController = () => {
  const { navigationController, addListeners, removeListeners } = useNavigation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    remainingDistance: 0,
    remainingTime: 0,
  });

  useEffect(() => {
    const callbacks = {
      onLocationChanged: (location: any) => {
        // Handle location changes
        console.log('Location changed:', location);
      },
      onRouteChanged: () => {
        // Handle route changes
        console.log('Route changed');
      },
      onNavigationStarted: () => {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: true,
        }));
      },
      onNavigationStopped: () => {
        setNavigationState({
          isNavigating: false,
          remainingDistance: 0,
          remainingTime: 0,
        });
      },
      onArrival: () => {
        setNavigationState({
          isNavigating: false,
          remainingDistance: 0,
          remainingTime: 0,
        });
      },
    };

    addListeners(callbacks);

    return () => {
      removeListeners(callbacks);
    };
  }, [addListeners, removeListeners]);

  const calculateRoute = async (
    origin: Coordinates,
    destination: Coordinates,
    _mode: TransportMode = 'driving'
  ): Promise<Route[]> => {
    try {
      // For now, use GoogleMapsService for route calculation
      // In production, you might want to use the SDK's route calculation
      const routes = await GoogleMapsService.getDirections(origin, destination, 'driving');
      return routes;
    } catch (error) {
      console.error('Route calculation error:', error);
      throw error;
    }
  };

  const startNavigation = async (
    destination: Coordinates,
    mode: TransportMode = 'driving'
  ): Promise<void> => {
    try {
      if (!navigationController) {
        throw new Error('Navigation controller not available');
      }

      // For now, just log the navigation start
      // The actual navigation will be handled by the NavigationView component
      console.log('Starting navigation to:', destination);
      console.log('Transport mode:', mode);
      
      // Update navigation state
      setNavigationState(prev => ({
        ...prev,
        isNavigating: true,
      }));
      
      console.log('Navigation started successfully');
    } catch (error) {
      console.error('Start navigation error:', error);
      throw error;
    }
  };

  const stopNavigation = async (): Promise<void> => {
    try {
      // For now, just update the state
      setNavigationState({
        isNavigating: false,
        remainingDistance: 0,
        remainingTime: 0,
      });
      
      console.log('Navigation stopped successfully');
    } catch (error) {
      console.error('Stop navigation error:', error);
      throw error;
    }
  };

  const recalculateRoute = async (): Promise<void> => {
    try {
      if (!navigationController) {
        throw new Error('Navigation controller not available');
      }

      // The SDK handles route recalculation automatically
      // But you can force it if needed
      console.log('Route recalculation requested');
    } catch (error) {
      console.error('Recalculate route error:', error);
      throw error;
    }
  };

  return {
    navigationState,
    calculateRoute,
    startNavigation,
    stopNavigation,
    recalculateRoute,
    navigationController,
  };
};