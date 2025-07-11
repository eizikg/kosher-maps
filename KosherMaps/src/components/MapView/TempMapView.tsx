import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const TempMapView: React.FC<any> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        Google Maps Navigation SDK will be loaded here.{'\n\n'}
        To complete setup:{'\n'}
        1. Add your Google Maps API key to .env file{'\n'}
        2. Configure platform-specific settings{'\n'}
        3. Test on device/simulator
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 24,
  },
});