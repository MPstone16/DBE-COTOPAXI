jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

// Solo los enums y funciones que usa la app; evita cargar el registro de push.
jest.mock('expo-notifications', () => ({
  ...jest.requireActual(
    'expo-notifications/build/NotificationChannelManager.types',
  ),
  ...jest.requireActual('expo-notifications/build/Notifications.types'),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getExactAlarmPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestExactAlarmPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
}));
