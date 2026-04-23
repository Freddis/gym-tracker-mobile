import {Switch, View, useColorScheme, Appearance, Alert, StyleSheet} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {useRouter} from 'expo-router';
import {FC, useContext, useState} from 'react';
import {AuthContext} from '@/components/providers/AuthProvider/AuthContext';
import {useSyncService} from '@/utils/SyncService/useSyncService';
import {useDrizzle} from '@/utils/drizzle';
import {Progress} from '@/utils/SyncService/types/Progress';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {ScreenContainer} from '@/components/blocks/ScreenContainer/ScreenContainer';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {Separator} from '@/components/blocks/Separator/Separator';
import {useQueryClient} from '@tanstack/react-query';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';

const styles = StyleSheet.create({
  progressContainer: {
    flex: 1,
    paddingTop: 100,
    paddingLeft: 20,
    paddingRight: 20,
  },
  progressText: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  flexGrow: {
    flexGrow: 1,
  },
  switch: {
    transform: [{scaleX: 0.7}, {scaleY: 0.7}],
  },
  linkContainer: {
    marginTop: 50,
    gap: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
});

export const SettingsScreen: FC = () => {
  const auth = useContext(AuthContext);
  const userId = auth.user?.id;
  const themeName = useColorScheme();
  const theme = useAppTheme();
  const router = useRouter();
  const [progresState, setProgressState] = useState<Progress | null>(null);
  const [syncService] = useSyncService();
  const [db] = useDrizzle();
  const queryClient = useQueryClient();
  if (!userId) {
    return null;
  }
  const performSignOut = () => {
    auth.logout();
    router.navigate('/');
  };
  const toggleTheme = () => {
    Appearance.setColorScheme(themeName === 'dark' ? 'light' : 'dark');
  };
  const syncWithServerButtonPress = async () => {
    const result = await syncService.syncWithServer(db, userId, (data) =>
      setProgressState({...data}),
    );
    const title = result.error ? 'Error' : 'Done';
    Alert.alert(title, result.message);
    queryClient.clear();
  };
  const wipeLocalData = async () => {
    const result = await syncService.wipeLocalData(db, userId, (data) =>
      setProgressState({...data}),
    );
    const title = result.error ? 'Error' : 'Done';
    Alert.alert(title, result.message);
    queryClient.clear();
  };
  const wipeLocalDataButtonPress = async () => {
    Alert.alert('Warning', 'Are you sure you want to delete local data?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: () => wipeLocalData()},
    ]);
  };

  if (progresState && !progresState.done) {
    const progress = `Processing ${progresState.itemsDone + 1}/${progresState.itemsNumber}: ${progresState.currentStageName}`;
    return (
      <ThemedView style={styles.progressContainer}>
        <ThemedText style={styles.progressText}>{progress}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedScrollView>
      <ScreenContainer>
        <ThemedBlock>
          <View style={styles.row}>
            <ThemedText style={styles.flexGrow}>Name:</ThemedText>
            <ThemedText>{auth.user?.name}</ThemedText>
          </View>
          <Separator />
          <View style={styles.row}>
            <ThemedText style={styles.flexGrow}>Email:</ThemedText>
            <ThemedText>{auth.user?.email}</ThemedText>
          </View>
          <Separator />
          <View style={styles.row}>
            <ThemedText style={styles.flexGrow}>Dark Mode:</ThemedText>
            <Switch
              value={themeName === 'dark'}
              onTouchStart={toggleTheme}
              style={styles.switch}
              trackColor={{true: theme.accent}}
            />
          </View>
          <View style={styles.linkContainer}>
            <ThemedLink onPress={syncWithServerButtonPress}>
              Sync Data With Server
            </ThemedLink>
            <ThemedLink onPress={wipeLocalDataButtonPress}>
              Wipe Local Data
            </ThemedLink>
            <ThemedLink onPress={performSignOut}>Sign Out</ThemedLink>
          </View>
        </ThemedBlock>
      </ScreenContainer>
    </ThemedScrollView>
  );
};
