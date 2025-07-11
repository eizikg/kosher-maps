import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TempMapView } from './TempMapView';
import { Coordinates, Route, NavigationState } from '../../types';
import { TempNavigationService as NavigationService } from '../../services/tempNavigation';
import { GoogleMapsService } from '../../services/googleMaps';
import { PermissionsService } from '../../utils/permissions';
import { GOOGLE_MAPS_CONFIG, COLORS } from '../../utils/constants';

interface MapViewProps {
  destination?: Coordinates;
  onLocationChange?: (location: Coordinates) => void;
  onRouteCalculated?: (routes: Route[]) => void;
  onNavigationStateChange?: (state: NavigationState) => void;
  showNavigation?: boolean;
  style?: any;
}

export const MapView: React.FC<MapViewProps> = ({
  destination,
  onLocationChange,
  onRouteCalculated,
  onNavigationStateChange,
  showNavigation = false,
  style,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isMapReady, _setIsMapReady] = useState(false);
  const locationWatchId = useRef<number | null>(null);

  useEffect(() => {
    const getCurrentLocationInternal = async () => {
      try {
        const location = await GoogleMapsService.getCurrentLocation();
        setCurrentLocation(location);
        onLocationChange?.(location);
      } catch (error) {
        console.error('Get current location error:', error);
        // Fallback to default location
        const defaultLocation = {
          latitude: GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION.latitude,
          longitude: GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION.longitude,
        };
        setCurrentLocation(defaultLocation);
        onLocationChange?.(defaultLocation);
      }
    };

    const startLocationWatchInternal = () => {
      locationWatchId.current = GoogleMapsService.watchLocation(
        (location) => {
          setCurrentLocation(location);
          onLocationChange?.(location);
        },
        (error) => {
          console.error('Location watch error:', error);
        }
      );
    };
    
    const initialize = async () => {
      try {
        const hasPermission = await PermissionsService.ensureLocationPermission();
        setHasLocationPermission(hasPermission);

        if (hasPermission) {
          await getCurrentLocationInternal();
          startLocationWatchInternal();
        } else {
          Alert.alert(
            'Location Permission Required',
            PermissionsService.getLocationPermissionRationale(),
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => PermissionsService.openLocationSettings() },
            ]
          );
        }
      } catch (error) {
        console.error('Location initialization error:', error);
      }
    };
    
    initialize();
    return () => {
      if (locationWatchId.current) {
        GoogleMapsService.clearLocationWatch(locationWatchId.current);
      }
    };
  }, [onLocationChange]);

  useEffect(() => {
    const unsubscribe = NavigationService.addListener((state) => {
      onNavigationStateChange?.(state);
    });
    return unsubscribe;
  }, [onNavigationStateChange]);

  useEffect(() => {
    const handleRouteCalculation = async () => {
      if (!currentLocation || !destination) return;

      try {
        const routes = await NavigationService.calculateRoute(currentLocation, destination);
        onRouteCalculated?.(routes);

        if (showNavigation && routes.length > 0) {
          await NavigationService.startNavigation(destination);
        }
      } catch (error) {
        console.error('Route calculation error:', error);
        Alert.alert('Navigation Error', 'Unable to calculate route to destination.');
      }
    };
    
    if (destination && currentLocation && isMapReady) {
      handleRouteCalculation();
    }
  }, [destination, currentLocation, isMapReady, onRouteCalculated, showNavigation]);





  if (!hasLocationPermission) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        {/* Could add a permission request UI here */}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TempMapView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
  },
  map: {
    flex: 1,
  },
});