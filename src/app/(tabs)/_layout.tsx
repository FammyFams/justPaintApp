import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { colors } from '@/theme';

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={{ default: colors.mutedForeground, selected: colors.primary }}
      labelStyle={{ default: { color: colors.mutedForeground }, selected: { color: colors.primary } }}
      // iOS keeps its system bar (liquid glass on iOS 26); Android gets the page color.
      backgroundColor={Platform.OS === 'android' ? colors.background : undefined}
      indicatorColor={colors.muted}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
        <NativeTabs.Trigger.Label>feed</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="challenge">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>challenge</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="post">
        {/* The website's hand-drawn circle, always crimson: it is the main call to action. */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tab-post.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>post</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <NativeTabs.Trigger.Icon sf={{ default: 'bell', selected: 'bell.fill' }} md="notifications" />
        <NativeTabs.Trigger.Label>activity</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
        <NativeTabs.Trigger.Label>profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
