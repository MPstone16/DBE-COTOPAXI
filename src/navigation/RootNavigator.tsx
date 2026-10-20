import React from 'react';
import { StyleSheet } from 'react-native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import HeaderSettingsButton from '../components/HeaderSettingsButton';
import SettingsScreen from '../screens/SettingsScreen';
import TimerScreen from '../screens/TimerScreen';
import { Colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = (): React.JSX.Element => (
  <Stack.Navigator initialRouteName="Timer" screenOptions={screenOptions}>
    <Stack.Screen name="Timer" component={TimerScreen} options={timerOptions} />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={settingsOptions}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontWeight: '600',
  },
  content: {
    backgroundColor: Colors.primary,
  },
});

const screenOptions: NativeStackNavigationOptions = {
  headerStyle: styles.header,
  headerTintColor: Colors.accentSecondary,
  headerTitleStyle: styles.headerTitle,
  headerShadowVisible: false,
  contentStyle: styles.content,
  animation: 'slide_from_right',
};

const renderSettingsButton = (): React.JSX.Element => <HeaderSettingsButton />;

const timerOptions: NativeStackNavigationOptions = {
  title: 'Pomodoro Cotopaxi',
  headerRight: renderSettingsButton,
};

const settingsOptions: NativeStackNavigationOptions = {
  title: 'Ajustes',
};

export default RootNavigator;
