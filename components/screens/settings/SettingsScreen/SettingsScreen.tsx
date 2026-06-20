import {Switch, View, useColorScheme, Appearance, Alert, StyleSheet, Modal, ActivityIndicator} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {FC, useContext, useState} from 'react';
import {AuthContext} from '@/components/providers/AuthProvider/AuthContext';
import {useDrizzle} from '@/utils/drizzle';
import {Progress} from '@/utils/SyncService/types/Progress';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {AppScreenContainer} from '@/components/blocks/AppScreenContainer/AppScreenContainer';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {Separator} from '@/components/blocks/Separator/Separator';
import {useQueryClient} from '@tanstack/react-query';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedButton} from '../../../blocks/ThemedButton/ThemedButton';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {activateKeepAwakeAsync, deactivateKeepAwake} from 'expo-keep-awake';

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
  const [progresState, setProgressState] = useState<Progress | null>(null);
  const {syncService, entryService, healthKitService} = useServices();
  const [db] = useDrizzle();
  const queryClient = useQueryClient();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [importedItems, setImportedItems] = useState(1);
  const [totalItems, setTotalItems] = useState(10);
  if (!userId) {
    return null;
  }
  const performSignOut = () => {
    auth.logout();
  };
  const toggleTheme = () => {
    Appearance.setColorScheme(themeName === 'dark' ? 'light' : 'dark');
  };
  const syncWithServerButtonPress = async () => {
    setShowSyncModal(true);
    await activateKeepAwakeAsync();
    const result = await syncService.syncWithServer(db, userId, (data) =>
      setProgressState({...data}),
    );
    const title = result.error ? 'Error' : 'Done';
    console.log('invalidating entries');
    queryClient.invalidateQueries();
    setShowSyncModal(false);
    activateKeepAwakeAsync();
    setTimeout(() => {
      Alert.alert(title, result.message);
    }, 500);
  };

  const wipeLocalData = async () => {
    const result = await syncService.wipeLocalData(db, userId, (data) =>
      setProgressState({...data}),
    );
    const title = result.error ? 'Error' : 'Done';
    Alert.alert(title, result.message);
    queryClient.invalidateQueries();
  };
  const wipeLocalDataButtonPress = async () => {
    Alert.alert('Warning', 'Are you sure you want to delete local data?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: () => wipeLocalData()},
    ]);
  };

  const onHealthClick = async () => {
    setShowImportModal(true);
    await activateKeepAwakeAsync();
    try {
      const authorized = await healthKitService.requestAuthorization();
      if (!authorized) {
        setShowImportModal(false);
        Alert.alert('Error', 'Please grant permission to access health data');
        return;
      }
      const workouts = await healthKitService.getWorkouts();
      setTotalItems(workouts.length);
      setImportedItems(0);
      console.log(`Found workouts: ${workouts.length}`);
      let i = 0;
      for (const workout of workouts) {
        setImportedItems(i++);
        const hr = await healthKitService.getHeartRateForWorkout(workout);
        if (!auth.user) {
          setShowImportModal(false);
          Alert.alert('Error', 'No user found');
          return;
        }
        await entryService.importFromHealthKit(auth.user, workout, hr, false);
      }
      setShowImportModal(false);
      Alert.alert('Success', 'Data imported successfully');
      queryClient.invalidateQueries();
      deactivateKeepAwake();
    } catch (error) {
      Alert.alert('Error', 'Error importing data from Health Kit');
      console.error(error);
      setShowImportModal(false);
      queryClient.invalidateQueries();
      deactivateKeepAwake();
    }
  };

  return (
      <AppScreenContainer safeTop={true}>
        <ThemedScrollView className="h-screen p-m">
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
          <ThemedButton onPress={onHealthClick} style={{marginTop: 30}}>
            Get Health Data
          </ThemedButton>
        </ThemedBlock>
        <Modal visible={showImportModal} transparent animationType="fade">
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000090'}}>
            <ThemedBlock style={{width: '80%', gap: theme.marginM}}>
              <ThemedText style={{textAlign: 'center'}}>Importing data from Health Kit</ThemedText>
              <ThemedText style={{textAlign: 'center'}}>{importedItems} of {totalItems} items imported</ThemedText>
              <ActivityIndicator size="large" color={theme.accent} />
            </ThemedBlock>
          </View>
        </Modal>
        <Modal visible={showSyncModal} transparent animationType="fade">
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000090'}}>
            <ThemedBlock style={{width: '80%', gap: theme.marginM}}>
            <ThemedText style={{textAlign: 'center'}}>
              Syncing data with server: {progresState?.itemsInProgress} of {progresState?.itemsNumber}
            </ThemedText>
            <ThemedText style={{textAlign: 'center'}}>{progresState?.currentStageName}</ThemedText>
            {progresState?.subItemsDone !== undefined && progresState.subItemsNumber !== undefined && (
              <ThemedText style={{textAlign: 'center'}}>{progresState?.subItemsDone} of {progresState?.subItemsNumber} items processed</ThemedText>
            )}
              <ActivityIndicator size="large" color={theme.accent} />
            </ThemedBlock>
          </View>
        </Modal>
        </ThemedScrollView>
      </AppScreenContainer>
  );
};
