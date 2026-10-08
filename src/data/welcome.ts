import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Set once the welcome screen has done its job on this phone: "continue as
// guest", or signed in at any point. Not under 'me', so signing out keeps it.
const STORAGE_KEY = 'jp_welcomed';
const QUERY_KEY = ['welcomed'];

export function useWelcomed() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return (await AsyncStorage.getItem(STORAGE_KEY)) === '1';
      } catch {
        // Better no welcome than one on every launch.
        return true;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}

export function useMarkWelcomed() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.setQueryData(QUERY_KEY, true);
    AsyncStorage.setItem(STORAGE_KEY, '1').catch(() => {});
  };
}
