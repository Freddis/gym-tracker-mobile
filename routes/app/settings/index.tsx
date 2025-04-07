import { ScrollView, Button, Switch, View, useColorScheme, Appearance } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import {useContext} from 'react';
import {AuthContext} from '@/components/AuthProvider/AuthContext';

export default function TabTwoScreen() {
  const auth = useContext(AuthContext)
  const theme = useColorScheme()
  const router = useRouter();

  const performSignOut = () => {
    auth.logout();
    router.navigate('/');
  }
  const toggleTheme = () => {
    Appearance.setColorScheme(theme === 'dark' ? 'light' : 'dark')
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
          <View style={{marginTop: 20}}>
            <Button onPress={performSignOut} title='Sign Out' />
          </View>
      </ScrollView>
    </ThemedView>
  );
}
