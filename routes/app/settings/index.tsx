import {ScrollView, Button, Switch, View, useColorScheme, Appearance, Alert} from 'react-native';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useRouter} from 'expo-router';
import {useContext, useState} from 'react';
import {AuthContext} from '@/components/AuthProvider/AuthContext';
import {useSyncService} from '@/utils/SyncService/useSyncService';
import {useDrizzle} from '@/utils/drizzle';
import {Progress} from '@/utils/SyncService/types/Progress';

export default function TabTwoScreen() {
  const auth = useContext(AuthContext);
  const userId = auth.user?.id;
  if (!userId) {
    throw new Error('User has to be logged in');
  }
  const theme = useColorScheme();
  const router = useRouter();
  const [progresState, setProgressState] = useState<Progress | null>(null);
  const [syncService] = useSyncService();
  const [db] = useDrizzle();

  const performSignOut = () => {
    auth.logout();
    router.navigate('/');
  };
  const toggleTheme = () => {
    Appearance.setColorScheme(theme === 'dark' ? 'light' : 'dark');
  };
  const syncWithServer = async () => {
    const result = await syncService.syncWithServer(db, userId, (data) => setProgressState({...data}));
    const title = result.error ? 'Error' : 'Done';
    Alert.alert(title, result.message);
  };
  const wipeLocalData = async () => {
    Alert.alert(
      'Warning',
      'Are you sure you want to delete local data?',
      [
        {
          text: 'No',
          onPress: () => {},
        },
        {
          text: 'Yes',
          onPress: () => syncService.wipeLocalData(db, userId, (data) => setProgressState({...data})),
        },
      ]
    );
  };

  if (progresState && !progresState.done) {
    const progress = `Processing ${progresState.itemsDone + 1}/${progresState.itemsNumber}: ${progresState.currentStageName}`;
    return (
    <ThemedView style={{flex: 1, paddingTop: 100, paddingLeft: 20, paddingRight: 20}}>
        <ThemedText style={{textAlign: 'center'}}>{progress}</ThemedText>
    </ThemedView>
    );
  }
  return (
    <ThemedView style={{flex: 1}}>
      <ScrollView style={{paddingTop: 70, paddingLeft: 20, paddingRight: 20}}>
          <ThemedText type="title">Settings</ThemedText>
          <View style={{marginTop: 20, display: 'flex', flexDirection: 'row'}}>
            <ThemedText style={{marginRight: 10}}>Name:</ThemedText>
            <View style={{flexGrow: 1, flexDirection: 'row-reverse'}}>
              <ThemedText>{auth.user?.name}</ThemedText>
            </View>
          </View>
          <View style={{marginTop: 20, display: 'flex', flexDirection: 'row'}}>
            <ThemedText style={{marginRight: 10}}>Email:</ThemedText>
            <View style={{flexGrow: 1, flexDirection: 'row-reverse'}}>
              <ThemedText>{auth.user?.email}</ThemedText>
            </View>
          </View>
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
            <ThemedText style={{marginRight: 10}}>Dark Mode</ThemedText>
            <View style={{flexGrow: 1, flexDirection: 'row-reverse'}}>
              <Switch value={theme === 'dark'} onTouchStart={toggleTheme} />
            </View>
          </View>
          <View>
            <Button onPress={syncWithServer} title="Sync Data With Server"/>
          </View>
          <View style={{marginTop: 20}}>
            <Button onPress={wipeLocalData} title="Wipe Local Data" />
          </View>
          <View style={{marginTop: 20}}>
            <Button onPress={performSignOut} title="Sign Out" />
          </View>
      </ScrollView>
    </ThemedView>
  );
}
