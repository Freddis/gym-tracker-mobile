import {Alert, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack} from 'expo-router';
import {FC, useState} from 'react';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {AppLogo} from '@/components/blocks/AppLogo/AppLogo';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';

export const PasswordRestoreScreen: FC = () => {
  const [login, setLogin] = useState('');
  const onSendPress = () => {
    Alert.alert('Not implemented yet');
  };
  return (
    <AppScreenContainer className="h-full p-m pt-l items-center justify-center" safeTop={true}>
      <Stack.Screen options={{title: 'Restore Password', headerShown: true}} />
      <ThemedView className="flex-col items-center justify-center flex-1 p-xl gap-l">
        <View className="my-l">
          <AppLogo />
        </View>
        <ThemedView className="">
          <ThemedText className="mb-s">
            Enter your email and we will send you new password if your account exists
          </ThemedText>
          <ThemedTextInput
            onChangeText={setLogin}
            value={login}
            placeholder="your@email.com"
          />
          <ThemedButton onPress={onSendPress} className="mt-xxl">
            Send
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </AppScreenContainer>
  );
};
