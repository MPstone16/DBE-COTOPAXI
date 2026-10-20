import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNotificationSync } from './src/hooks/useNotificationSync';
import RootNavigator from './src/navigation/RootNavigator';

// HU-006: acceso directo a la app principal, sin autenticación.
const App = (): React.JSX.Element => {
  useNotificationSync();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
