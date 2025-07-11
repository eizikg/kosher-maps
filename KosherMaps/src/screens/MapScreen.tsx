import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { MapView } from '../components/MapView';
import { SearchBar } from '../components/SearchBar';
import { NavigationCard } from '../components/NavigationCard';
import { RoutePreview } from '../components/RoutePreview';
import { 
  Coordinates, 
  Place, 
  Route, 
  NavigationState, 
  TransportMode,
} from '../types';
import { TempNavigationService as NavigationService } from '../services/tempNavigation';
import { PlacesService } from '../services/places';
import { COLORS } from '../utils/constants';

export const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Coordinates | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    remainingDistance: 0,
    remainingTime: 0,
  });
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const [showRoutePreview, setShowRoutePreview] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      await PlacesService.initialize();
    } catch (error) {
      console.error('Services initialization error:', error);
    }
  };

  const handleLocationChange = (location: Coordinates) => {
    setUserLocation(location);
  };

  const handlePlaceSelected = (place: Place) => {
    setSelectedDestination(place.coordinates);
  };

  const handleLocationSelected = (coordinates: Coordinates) => {
    setSelectedDestination(coordinates);
  };

  const handleRouteCalculated = (routes: Route[]) => {
    setAvailableRoutes(routes);
    setSelectedRouteIndex(0);
    if (routes.length > 0 && !navigationState.isNavigating) {
      setShowRoutePreview(true);
    }
  };

  const handleNavigationStateChange = (state: NavigationState) => {
    setNavigationState(state);
    if (state.isNavigating) {
      setShowRoutePreview(false);
    }
  };

  const handleRouteSelected = (routeIndex: number) => {
    setSelectedRouteIndex(routeIndex);
  };

  const handleStartNavigation = async (_route: Route) => {
    try {
      if (!selectedDestination) {
        Alert.alert('Error', 'No destination selected');
        return;
      }

      await NavigationService.startNavigation(selectedDestination, transportMode);
      setShowRoutePreview(false);
    } catch (error) {
      console.error('Start navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to start navigation. Please try again.');
    }
  };

  const handleStopNavigation = async () => {
    try {
      await NavigationService.stopNavigation();
      setSelectedDestination(null);
      setAvailableRoutes([]);
      setShowRoutePreview(false);
    } catch (error) {
      console.error('Stop navigation error:', error);
    }
  };

  const handleRecalculateRoute = async () => {
    try {
      if (!userLocation || !selectedDestination) return;
      
      const routes = await NavigationService.calculateRoute(
        userLocation, 
        selectedDestination, 
        transportMode
      );
      setAvailableRoutes(routes);
    } catch (error) {
      console.error('Recalculate route error:', error);
    }
  };

  const handleShowRouteOverview = () => {
    // This is handled by the NavigationService
  };

  const handleTransportModeChange = async (mode: TransportMode) => {
    setTransportMode(mode);
    
    // Recalculate routes with new transport mode
    if (userLocation && selectedDestination && !navigationState.isNavigating) {
      try {
        const routes = await NavigationService.calculateRoute(
          userLocation,
          selectedDestination,
          mode
        );
        setAvailableRoutes(routes);
        setSelectedRouteIndex(0);
      } catch (error) {
        console.error('Transport mode change error:', error);
      }
    }
  };

  const handleCloseRoutePreview = () => {
    setShowRoutePreview(false);
    setSelectedDestination(null);
    setAvailableRoutes([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={COLORS.PRIMARY}
      />
      
      {/* Map View */}
      <MapView
        destination={selectedDestination || undefined}
        onLocationChange={handleLocationChange}
        onRouteCalculated={handleRouteCalculated}
        onNavigationStateChange={handleNavigationStateChange}
        showNavigation={navigationState.isNavigating}
        style={styles.map}
      />

      {/* Search Bar */}
      {!navigationState.isNavigating && (
        <View style={styles.searchContainer}>
          <SearchBar
            onPlaceSelected={handlePlaceSelected}
            onLocationSelected={handleLocationSelected}
            userLocation={userLocation || undefined}
            placeholder="Where to?"
          />
        </View>
      )}

      {/* Navigation Card */}
      {navigationState.isNavigating && (
        <View style={styles.navigationContainer}>
          <NavigationCard
            navigationState={navigationState}
            onStopNavigation={handleStopNavigation}
            onRecalculateRoute={handleRecalculateRoute}
            onShowRouteOverview={handleShowRouteOverview}
          />
        </View>
      )}

      {/* Route Preview */}
      {showRoutePreview && availableRoutes.length > 0 && (
        <View style={styles.routePreviewContainer}>
          <RoutePreview
            routes={availableRoutes}
            selectedRouteIndex={selectedRouteIndex}
            transportMode={transportMode}
            onRouteSelected={handleRouteSelected}
            onStartNavigation={handleStartNavigation}
            onTransportModeChange={handleTransportModeChange}
            onClose={handleCloseRoutePreview}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  navigationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  routePreviewContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
});