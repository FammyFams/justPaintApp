import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { CloseButton } from '@/screens/auth/close-button';
import { colors } from '@/theme';

// Sign in, sign up and forgot password, in one modal over the app. The root
// layout only offers it while signed out, so signing in closes it.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerShown: true,
        title: '',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: colors.foreground,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        // The modal is one screen of the root stack: closing it leaves that.
        // Android's back arrow already closes it from the first screen.
        headerRight:
          Platform.OS === 'ios'
            ? () => <CloseButton onPress={() => navigation.getParent()?.goBack()} />
            : undefined,
      })}
    />
  );
}
