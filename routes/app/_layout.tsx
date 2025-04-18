import {Tabs} from 'expo-router';
import React from 'react';
import {Platform, useColorScheme} from 'react-native';
import {HapticTab} from '@/components/blocks/HapticTab/HapticTab';
import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import TabBarBackground from '@/components/blocks/TabBarBackground/TabBarBackground';
import {Colors} from '@/types/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
           <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({color}) => <IconSymbol size={28} name="calendar" color={color} />,
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
