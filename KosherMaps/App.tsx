/**
 * KosherMaps - React Native Maps Navigation App
 * 
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationProvider, TaskRemovedBehavior } from '@googlemaps/react-native-navigation-sdk';
import { MapScreen } from './src/screens/MapScreen';

// Flipper setup for debugging
if (__DEV__) {
  require('react-native-flipper').default();
}

const App: React.FC = () => {
  const termsAndConditionsOptions = {
    title: 'Terms and Conditions',
    companyName: 'KosherMaps',
    showOnlyDisclaimer: true,
  };

  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={termsAndConditionsOptions}
      taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
    >
      <MapScreen />
    </NavigationProvider>
  );
};

export default App;
