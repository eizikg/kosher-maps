import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationState } from '../../types';
import { TempNavigationService as NavigationService } from '../../services/tempNavigation';
import { COLORS } from '../../utils/constants';

interface NavigationCardProps {
  navigationState: NavigationState;
  onStopNavigation: () => void;
  onRecalculateRoute: () => void;
  onShowRouteOverview: () => void;
  style?: any;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  navigationState,
  onStopNavigation,
  onRecalculateRoute,
  onShowRouteOverview,
  style,
}) => {
  if (!navigationState.isNavigating) {
    return null;
  }

  const handleStopNavigation = () => {
    Alert.alert(
      'Stop Navigation',
      'Are you sure you want to stop navigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop', style: 'destructive', onPress: onStopNavigation },
      ]
    );
  };

  const handleRecalculateRoute = async () => {
    try {
      await NavigationService.recalculateRoute();
      onRecalculateRoute();
    } catch (error) {
      console.error('Recalculate route error:', error);
      Alert.alert('Error', 'Unable to recalculate route. Please try again.');
    }
  };

  const handleShowOverview = async () => {
    try {
      await NavigationService.showRouteOverview();
      onShowRouteOverview();
    } catch (error) {
      console.error('Show overview error:', error);
    }
  };

  const getManeuverIcon = (maneuver?: string): string => {
    if (!maneuver) return 'navigation';
    
    const iconMap: Record<string, string> = {
      'turn-left': 'turn-left',
      'turn-right': 'turn-right',
      'turn-slight-left': 'turn-slight-left',
      'turn-slight-right': 'turn-slight-right',
      'turn-sharp-left': 'turn-sharp-left',
      'turn-sharp-right': 'turn-sharp-right',
      'uturn-left': 'u-turn-left',
      'uturn-right': 'u-turn-right',
      'straight': 'straight',
      'ramp-left': 'ramp-left',
      'ramp-right': 'ramp-right',
      'merge': 'merge',
      'fork-left': 'fork-left',
      'fork-right': 'fork-right',
      'ferry': 'directions-boat',
      'roundabout-left': 'roundabout-left',
      'roundabout-right': 'roundabout-right',
    };

    return iconMap[maneuver] || 'navigation';
  };

  const formatInstruction = (instruction: string): string => {
    // Clean up HTML tags and excessive whitespace
    return instruction
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const currentStep = navigationState.currentStep;
  const remainingDistance = NavigationService.formatDistance(navigationState.remainingDistance);
  const remainingTime = NavigationService.formatDuration(navigationState.remainingTime);

  return (
    <View style={[styles.container, style]}>
      {/* Main Navigation Info */}
      <View style={styles.mainInfo}>
        <View style={styles.maneuverContainer}>
          <Icon
            name={getManeuverIcon(currentStep?.maneuver)}
            size={32}
            color={COLORS.PRIMARY}
          />
        </View>
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction} numberOfLines={2}>
            {currentStep ? formatInstruction(currentStep.instruction) : 'Navigate to destination'}
          </Text>
          {currentStep && (
            <Text style={styles.stepDistance}>
              {NavigationService.formatDistance(currentStep.distance)}
            </Text>
          )}
        </View>
      </View>

      {/* Trip Summary */}
      <View style={styles.tripSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{remainingTime}</Text>
          <Text style={styles.summaryLabel}>Remaining</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{remainingDistance}</Text>
          <Text style={styles.summaryLabel}>Distance</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShowOverview}
        >
          <Icon name="map" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.actionButtonText}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRecalculateRoute}
        >
          <Icon name="refresh" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.actionButtonText}>Recalculate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.stopButton]}
          onPress={handleStopNavigation}
        >
          <Icon name="stop" size={20} color={COLORS.ERROR} />
          <Text style={[styles.actionButtonText, styles.stopButtonText]}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  maneuverContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContainer: {
    flex: 1,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  stepDistance: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  tripSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.BORDER,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    marginLeft: 4,
    fontWeight: '600',
  },
  stopButton: {
    borderColor: COLORS.ERROR,
  },
  stopButtonText: {
    color: COLORS.ERROR,
  },
});