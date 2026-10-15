import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

// expo-notifications, or null where it can't load: Expo Go on Android dropped
// its push native modules (SDK 53), and importing it there throws, which took
// the whole app down. Real builds, and Expo Go on iPhone, have it.
const inExpoGoOnAndroid =
  Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const Notifications: NotificationsModule | null = inExpoGoOnAndroid
  ? null
  : // Loaded on demand on purpose: a top-level import would run (and throw) everywhere.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-notifications');
