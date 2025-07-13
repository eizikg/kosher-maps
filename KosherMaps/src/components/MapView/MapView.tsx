import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
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
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📍</Text>
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionMessage}>
            KosherMaps needs location access to show your position on the map and provide navigation directions.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={async () => {
              const hasPermission = await PermissionsService.ensureLocationPermission();
              setHasLocationPermission(hasPermission);
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Location Access</Text>
          </TouchableOpacity>
        </View>
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
  permissionContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 320,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionMessage: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  permissionButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
});