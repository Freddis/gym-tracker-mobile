import { ScrollView, Button, Switch, View, useColorScheme, Appearance, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import {useContext, useState} from 'react';
import {AuthContext} from '@/components/AuthProvider/AuthContext';
import {useSyncService} from '@/utils/SyncService/useSyncService';
import {useDrizzle} from '@/utils/drizzle';
import {Progress} from '@/utils/SyncService/types/Progress';

export default function TabTwoScreen() {
  const auth = useContext(AuthContext)
  const theme = useColorScheme()
  const router = useRouter();
  const [syncState, setSyncState] = useState<Progress |  null>(null);
  const [syncService] = useSyncService();
  const [db] = useDrizzle();
  
  const performSignOut = () => {
    auth.logout();
    router.navigate('/');
  }
  const toggleTheme = () => {
    Appearance.setColorScheme(theme === 'dark' ? 'light' : 'dark')
  }
  const syncWithServer = async () => {
    Alert.alert(
      'Sync With Server',
      'Want to wipe local data before sync?',
      [
        {
          text: 'No',
          onPress: () => performSync(false)
        },
        {
          text: 'Yes',
          onPress: () => performSync(true)
        }
      ]
    )
  }

  const performSync = async (wipe = false) => {
    const userId = auth.user?.id;
    if(!userId){
      throw new Error("User has to be logged in");
    }
    const method = wipe ? syncService.wipeThenSync.bind(syncService) : syncService.syncWithServer.bind(syncService);
    const result = await method(db,userId,(data) => {
      setSyncState({...data})
    })
    const title = result.error ? 'Error' : 'Done';
    Alert.alert(title,result.message)
  }

  if(syncState && !syncState.done){
    return (
    <ThemedView style={{flex: 1,paddingTop: 100, paddingLeft: 20, paddingRight: 20}}>
        <ThemedText style={{textAlign: 'center'}}>Processing {syncState.itemsDone+1}/{syncState.itemsNumber}: {syncState.currentStageName}</ThemedText>
    </ThemedView>
    )
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
            <Button onPress={syncWithServer} title='Sync Data With Server'/>
          </View>
          <View style={{marginTop: 20}}>
            <Button onPress={performSignOut} title='Sign Out' />
          </View>
      </ScrollView>
    </ThemedView>
  );
}
