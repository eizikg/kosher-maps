import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { GoogleMapsView } from './TempMapView';
import { Coordinates, Route } from '../../types';
import { useNavigationController } from '../../hooks/useNavigationController';
import { GoogleMapsService } from '../../services/googleMaps';
import { PermissionsService } from '../../utils/permissions';
import { GOOGLE_MAPS_CONFIG, COLORS } from '../../utils/constants';

interface MapViewProps {
  destination?: Coordinates;
  onLocationChange?: (location: Coordinates) => void;
  onRouteCalculated?: (routes: Route[]) => void;
  onNavigationStateChange?: () => void;
  showNavigation?: boolean;
  style?: any;
  routes?: Route[];
  selectedRouteIndex?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  destination,
  onLocationChange,
  onRouteCalculated,
  showNavigation = false,
  style,
  routes = [],
  selectedRouteIndex = 0,
}) => {
  const { calculateRoute } = useNavigationController();
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
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

  // Navigation state is now handled by the hook in the parent component

  useEffect(() => {
    const handleRouteCalculation = async () => {
      if (!currentLocation || !destination) return;

      try {
        const calculatedRoutes = await calculateRoute(currentLocation, destination);
        onRouteCalculated?.(calculatedRoutes);

        // Navigation start is handled by the parent component
        // The map view just calculates and displays routes
      } catch (error) {
        console.error('Route calculation error:', error);
        Alert.alert('Navigation Error', 'Unable to calculate route to destination.');
      }
    };
    
    if (destination && currentLocation && isMapReady) {
      handleRouteCalculation();
    }
  }, [destination, currentLocation, isMapReady, onRouteCalculated, showNavigation, calculateRoute]);





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

  const handleMapReady = () => {
    setIsMapReady(true);
  };

  const handleMapLocationChange = (location: Coordinates) => {
    setCurrentLocation(location);
    onLocationChange?.(location);
  };

  return (
    <View style={[styles.container, style]}>
      <GoogleMapsView
        style={styles.map}
        userLocation={currentLocation || undefined}
        destination={destination}
        routes={routes}
        selectedRouteIndex={selectedRouteIndex}
        showNavigation={showNavigation}
        onMapReady={handleMapReady}
        onLocationChange={handleMapLocationChange}
      />
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