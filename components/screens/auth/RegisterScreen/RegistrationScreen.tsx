import {Button} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import {FC, useState} from 'react';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';

export const RegistrationScreen: FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const performRegistration = () => {
    router.navigate('/');
  };
  return (
    <ThemedView style={{flex: 1}}>
      <Stack.Screen options={{title: 'Sign up', headerShown: true}} />
      <ThemedText style={{paddingTop: 70, textAlign: 'center'}}> Gym Tracker</ThemedText>
      <ThemedView style={{padding: 20}}>
        <ThemedText>Name</ThemedText>
        <ThemedTextInput onChangeText={setLogin} value={login} placeholder="John Snow"></ThemedTextInput>
        <ThemedText>Email</ThemedText>
        <ThemedTextInput onChangeText={setLogin} value={login} placeholder="your@email.com"></ThemedTextInput>
        <ThemedText>Password</ThemedText>
        <ThemedTextInput onChangeText={setPassword} value={password} placeholder="******"></ThemedTextInput>
        <ThemedText>Password Confirmation</ThemedText>
        <ThemedTextInput onChangeText={setPassword} value={password} placeholder="******"></ThemedTextInput>
        <Button onPress={performRegistration} title="Sign Up"/>
      </ThemedView>
    </ThemedView>
  );
};
