import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Colors are inline until module A2 adds src/theme.ts.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fbf5f3' },
        }}
      />
    </>
  );
}
