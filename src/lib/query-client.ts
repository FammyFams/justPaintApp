import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
    },
  },
});

// React Native has no window focus: refetch stale queries when the app comes back
// to the foreground instead.
AppState.addEventListener('change', (state) => {
  focusManager.setFocused(state === 'active');
});
