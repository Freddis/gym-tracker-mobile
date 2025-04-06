import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SQLite from 'expo-sqlite';
import { SQLiteProvider } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../db/migrations/migrations.js'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider} from '@/components/AuthProvider/AuthProvider';

const expoDb = SQLite.openDatabaseSync('db.db');
const db = drizzle(expoDb)
const queryClient = new QueryClient();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  useMigrations(db, migrations);
  // const { success, error } = useMigrations(db, migrations);
  // if (error) {
  //   return (
  //     <View>
  //       <Text>Migration error: {error.message}</Text>
  //     </View>
  //   );
  // }
  // if (!success) {
  //   return (
  //     <View>
  //       <Text>Migration is in progress...</Text>
  //     </View>
  //   );
  // }
  if (!loaded) {
    return null;
  }

  return (
  <SQLiteProvider databaseName="db.db">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot screenOptions={{}}/>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </SQLiteProvider>
  );
}
