import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Slot} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect} from 'react';
import 'react-native-reanimated';
import {SQLiteProvider} from 'expo-sqlite';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../db/migrations/migrations';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider} from '@/components/providers/AuthProvider/AuthProvider';
import {useDrizzle} from '@/utils/drizzle';
import {useColorScheme, View} from 'react-native';
import {Colors} from 'react-native-ui-lib';
import {ThemedText} from '../components/blocks/ThemedText/ThemedText';
import {ScreenContainer} from '../components/blocks/ScreenContainer/ScreenContainer';
import {ServiceProvider} from '../components/providers/ServiceProvider/ServiceProvider';

// console.log = () => null // uncomment for prod / preview
export const queryClient = new QueryClient();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [db] = useDrizzle();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // you have to enjoy the logo
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [loaded]);

  useMigrations(db, migrations);
  // todo: figure out how to make it not throw errors in dev mode
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {success, error} = useMigrations(db, migrations);
  if (error) {
    return (
      <ScreenContainer>
        <View>
          <ThemedText>Migration error: {error.message}</ThemedText>
        </View>
      </ScreenContainer>
    );
  }
  // if (!success) {
  //   return (
  //     <View>
  //       <ThemedText>Migration is in progress...</ThemedText>
  //     </View>
  //   );
  // }
  if (!loaded) {
    return null;
  }
  if (colorScheme === 'dark') {
    Colors.setScheme('dark');
  } else {
    Colors.setScheme('light');
  }


  return (
  <SQLiteProvider databaseName="db.db">
    <QueryClientProvider client={queryClient}>
      <ServiceProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Slot screenOptions={{}}/>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </ServiceProvider>
    </QueryClientProvider>
  </SQLiteProvider>
  );
}
