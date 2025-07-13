import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NavigationView, MapView } from '@googlemaps/react-native-navigation-sdk';
import { Coordinates, Route } from '../../types';
import { COLORS } from '../../utils/constants';

interface GoogleMapsViewProps {
  style?: any;
  _userLocation?: Coordinates;
  _destination?: Coordinates;
  _routes?: Route[];
  _selectedRouteIndex?: number;
  showNavigation?: boolean;
  onMapReady?: () => void;
  _onLocationChange?: (location: Coordinates) => void;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  style,
  showNavigation = false,
  onMapReady,
}) => {
  // Map refs are handled internally by the SDK components
  const [_isMapInitialized, setIsMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Route visualization is now handled by the SDK automatically
  // when navigation is active. For route preview, we'll use the
  // route data passed from the parent component.

  const handleMapReady = () => {
    console.log('Google Maps Navigation View is ready');
    setIsMapInitialized(true);
    setMapError(null);
    onMapReady?.();
  };

  // Camera configuration is handled by the SDK

  if (mapError) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={styles.errorTitle}>Map Load Error</Text>
        <Text style={styles.errorMessage}>{mapError}</Text>
        <Text style={styles.errorSubtitle}>
          Make sure you have added your Google Maps API key to the .env file
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showNavigation ? (
        <NavigationView
          style={styles.map}
          onNavigationViewControllerCreated={() => {
            console.log('Navigation view controller created');
            handleMapReady();
          }}
          onMapViewControllerCreated={() => {
            console.log('Map view controller created');
          }}
        />
      ) : (
        <MapView
          style={styles.map}
          onMapViewControllerCreated={() => {
            console.log('Map view controller created');
            handleMapReady();
          }}
        />
      )}
    </View>
  );
};

// Keep TempMapView as fallback for development
export const TempMapView: React.FC<any> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <GoogleMapsView style={style} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: 20,
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});