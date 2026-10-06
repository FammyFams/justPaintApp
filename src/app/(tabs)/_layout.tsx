import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { TabIcon } from '@/components/tab-icon';
import { colors, fonts } from '@/theme';

// JS tabs, not NativeTabs: on iOS 26 the native bar is always see-through
// Liquid Glass. This one is flat and solid, like the website.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'feed',
          tabBarIcon: (props) => (
            <TabIcon
              name={{ ios: 'square.grid.2x2', android: 'grid_view' }}
              selectedName={{ ios: 'square.grid.2x2.fill', android: 'grid_view' }}
              {...props}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: 'challenge',
          tabBarIcon: (props) => (
            <TabIcon name={{ ios: 'calendar', android: 'calendar_month' }} {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'post',
          // The website's hand-drawn circle, always crimson: it is the main call to action.
          tabBarIcon: () => (
            <Image source={require('@/assets/images/tab-post.png')} style={styles.postIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'activity',
          tabBarIcon: (props) => (
            <TabIcon
              name={{ ios: 'bell', android: 'notifications' }}
              selectedName={{ ios: 'bell.fill', android: 'notifications' }}
              {...props}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'profile',
          tabBarIcon: (props) => (
            <TabIcon
              name={{ ios: 'person', android: 'person' }}
              selectedName={{ ios: 'person.fill', android: 'person' }}
              {...props}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  postIcon: {
    width: 30,
    height: 24,
  },
});
