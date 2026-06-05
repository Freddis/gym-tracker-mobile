import {Alert, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack} from 'expo-router';
import {FC, useState} from 'react';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {AppLogo} from '@/components/blocks/AppLogo/AppLogo';
import {useResponseErrors} from '@/hooks/useResponseErrors';
import {ThemedInputError} from '@/components/blocks/ThemedInputError/ThemedInputError';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';

export const RegistrationScreen: FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const {getError} = useResponseErrors();
  const performRegistration = () => {
    // TODO: implement registration logic
    Alert.alert('Not implemented yet');
  };
  return (
    <AppScreenContainer className="h-full pt-xxl" safeTop={true}>
      <Stack.Screen options={{title: 'Sign up', headerShown: true}} />
      <View className="my-xl">
        <AppLogo horizontal/>
      </View>
      <ThemedView className="w-full px-xxl">
        <ThemedText className="mb-s">Name</ThemedText>
        <ThemedTextInput onChangeText={setLogin} value={login} placeholder="John Snow" />
        <ThemedInputError error={getError('password')} />

        <ThemedText className="mb-s">Email</ThemedText>
        <ThemedTextInput onChangeText={setLogin} value={login} placeholder="your@email.com" />
        <ThemedInputError error={getError('password')} />

        <ThemedText className="mb-s">Password</ThemedText>
        <ThemedTextInput onChangeText={setPassword} value={password} placeholder="******" />
        <ThemedInputError error={getError('password')} />

        <ThemedText className="mb-s">Password Confirmation</ThemedText>
        <ThemedTextInput onChangeText={setPassword} value={password} placeholder="******" />
        <ThemedInputError error={getError('password')} />

        <ThemedButton onPress={performRegistration} className="mt-xxl">
          Sign Up
        </ThemedButton>
      </ThemedView>
    </AppScreenContainer>
  );
};
