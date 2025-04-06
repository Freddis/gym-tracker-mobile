import { ScrollView, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, useRouter } from 'expo-router';
import {useContext} from 'react';
import {AuthContext} from '@/components/AuthProvider/AuthContext';

export default function TabTwoScreen() {
  const auth = useContext(AuthContext)
  const router = useRouter();

  const performSignOut = () => {
    auth.logout();
    router.navigate('/');
  }
  return (
    <ThemedView style={{flex: 1}}>
      <ScrollView style={{paddingTop: 70, paddingLeft: 20, paddingRight: 20}}>
          <ThemedText type="title">Settings</ThemedText>
          <ThemedText style={{marginTop: 20}}>{auth.user?.email}</ThemedText>
          <Button onPress={performSignOut} title='Sign Out'></Button>
      </ScrollView>
    </ThemedView>
  );
}
