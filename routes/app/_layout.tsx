import {Redirect, Tabs} from 'expo-router';
import React from 'react';
import {Platform, useColorScheme} from 'react-native';
import {HapticTab} from '@/components/blocks/HapticTab/HapticTab';
import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import TabBarBackground from '@/components/blocks/TabBarBackground/TabBarBackground';
import {Colors} from '@/types/Colors';
import {useAuth} from '../../components/providers/AuthProvider/useAuth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  if (!auth.user) {
    return <Redirect href="/auth/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme === 'light' ? 'light' : 'dark'].tint,
        headerShown: false,
        lazy: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            // position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="entries"
        options={{
          title: 'Entries',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard/dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="chart.bar.xaxis.ascending" color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Execises',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="dumbbell.fill" color={color} />,
        }}
      />
       <Tabs.Screen
        name="settings/settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
