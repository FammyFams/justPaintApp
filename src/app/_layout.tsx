import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_400Regular_Italic } from '@expo-google-fonts/plus-jakarta-sans/400Regular_Italic';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSession } from '@/data/account';
import { queryClient } from '@/lib/query-client';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Pages pushed over the tabs: a plain bar with just a back chevron.
const pageHeader = {
  headerShown: true,
  title: '',
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: colors.foreground,
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
} as const;

// "sign in to post, heart and comment", sized to its content.
const accountSheet = {
  presentation: 'formSheet',
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
  contentStyle: { backgroundColor: colors.card },
} as const;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [fonts.regular]: PlusJakartaSans_400Regular,
    [fonts.italic]: PlusJakartaSans_400Regular_Italic,
    [fonts.semibold]: PlusJakartaSans_600SemiBold,
    [fonts.extrabold]: PlusJakartaSans_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootStack />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

// Inside the query provider, since it reads the session.
function RootStack() {
  const { signedIn } = useSession();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* First, so it's what opens when the launch link names no page. */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="painting/[id]" options={pageHeader} />
      <Stack.Screen name="artist/[name]" options={pageHeader} />
      {/* Only while signed out: signing in removes them, closing whichever is open. */}
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="require-account" options={accountSheet} />
      </Stack.Protected>
    </Stack>
  );
}
