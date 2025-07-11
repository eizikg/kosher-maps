import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Route, TransportMode } from '../../types';
import { TempNavigationService as NavigationService } from '../../services/tempNavigation';
import { COLORS, TRANSPORT_MODES } from '../../utils/constants';

interface RoutePreviewProps {
  routes: Route[];
  selectedRouteIndex: number;
  transportMode: TransportMode;
  onRouteSelected: (routeIndex: number) => void;
  onStartNavigation: (route: Route) => void;
  onTransportModeChange: (mode: TransportMode) => void;
  onClose: () => void;
  style?: any;
}

export const RoutePreview: React.FC<RoutePreviewProps> = ({
  routes,
  selectedRouteIndex,
  transportMode,
  onRouteSelected,
  onStartNavigation,
  onTransportModeChange,
  onClose,
  style,
}) => {
  const [isStartingNavigation, setIsStartingNavigation] = useState(false);

  if (routes.length === 0) {
    return null;
  }

  const selectedRoute = routes[selectedRouteIndex] || routes[0];

  const handleStartNavigation = async () => {
    try {
      setIsStartingNavigation(true);
      await onStartNavigation(selectedRoute);
    } catch (error) {
      console.error('Start navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to start navigation. Please try again.');
    } finally {
      setIsStartingNavigation(false);
    }
  };

  const getRouteTypeDescription = (route: Route, index: number): string => {
    if (routes.length === 1) return 'Best route';
    if (index === 0) return 'Fastest route';
    return `Alternative route ${index}`;
  };

  const getTrafficColor = (route: Route): string => {
    // This would ideally come from traffic data
    // For now, we'll use a simple heuristic based on duration vs distance
    const avgSpeed = route.distance / route.duration; // m/s
    if (avgSpeed > 15) return COLORS.SUCCESS; // Good traffic
    if (avgSpeed > 8) return COLORS.WARNING; // Moderate traffic
    return COLORS.ERROR; // Heavy traffic
  };

  const renderRoute = ({ item, index }: { item: Route; index: number }) => (
    <TouchableOpacity
      style={[
        styles.routeCard,
        index === selectedRouteIndex && styles.selectedRouteCard,
      ]}
      onPress={() => onRouteSelected(index)}
    >
      <View style={styles.routeHeader}>
        <Text style={[
          styles.routeType,
          index === selectedRouteIndex && styles.selectedRouteText,
        ]}>
          {getRouteTypeDescription(item, index)}
        </Text>
        <View style={[styles.trafficIndicator, { backgroundColor: getTrafficColor(item) }]} />
      </View>

      <View style={styles.routeDetails}>
        <View style={styles.routeMetric}>
          <Text style={[
            styles.metricValue,
            index === selectedRouteIndex && styles.selectedRouteText,
          ]}>
            {NavigationService.formatDuration(item.duration)}
          </Text>
          <Text style={styles.metricLabel}>Time</Text>
        </View>

        <View style={styles.routeMetric}>
          <Text style={[
            styles.metricValue,
            index === selectedRouteIndex && styles.selectedRouteText,
          ]}>
            {NavigationService.formatDistance(item.distance)}
          </Text>
          <Text style={styles.metricLabel}>Distance</Text>
        </View>

        <View style={styles.routeMetric}>
          <Text style={[
            styles.metricValue,
            index === selectedRouteIndex && styles.selectedRouteText,
          ]}>
            {item.steps.length}
          </Text>
          <Text style={styles.metricLabel}>Steps</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransportMode = (mode: TransportMode) => (
    <TouchableOpacity
      key={mode}
      style={[
        styles.transportButton,
        mode === transportMode && styles.selectedTransportButton,
      ]}
      onPress={() => onTransportModeChange(mode)}
    >
      <Icon
        name={TRANSPORT_MODES[mode].icon}
        size={24}
        color={mode === transportMode ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY}
      />
      <Text style={[
        styles.transportText,
        mode === transportMode && styles.selectedTransportText,
      ]}>
        {TRANSPORT_MODES[mode].name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Route Options</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Transport Mode Selector */}
      <View style={styles.transportModes}>
        {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map(renderTransportMode)}
      </View>

      {/* Routes List */}
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={renderRoute}
        style={styles.routesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Selected Route Summary */}
      <View style={styles.selectedRouteSummary}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>Selected Route</Text>
          <Text style={styles.summaryDetails}>
            {NavigationService.formatDuration(selectedRoute.duration)} • {NavigationService.formatDistance(selectedRoute.distance)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.startButton, isStartingNavigation && styles.startButtonDisabled]}
          onPress={handleStartNavigation}
          disabled={isStartingNavigation}
        >
          <Icon 
            name="navigation" 
            size={20} 
            color={COLORS.BACKGROUND} 
            style={styles.startButtonIcon}
          />
          <Text style={styles.startButtonText}>
            {isStartingNavigation ? 'Starting...' : 'Start Navigation'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: 4,
  },
  transportModes: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  transportButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    minWidth: 80,
  },
  selectedTransportButton: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  transportText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontWeight: '500',
  },
  selectedTransportText: {
    color: COLORS.BACKGROUND,
  },
  routesList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 300,
  },
  routeCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteCard: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.BACKGROUND,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  selectedRouteText: {
    color: COLORS.PRIMARY,
  },
  trafficIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeMetric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  selectedRouteSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  summaryDetails: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  startButtonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BACKGROUND,
  },
});