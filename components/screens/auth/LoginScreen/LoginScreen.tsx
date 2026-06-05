import {Alert, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import {FC, useContext, useEffect, useState} from 'react';
import {LoginError} from '@/openapi-client';
import {AuthContext} from '@/components/providers/AuthProvider/AuthContext';
import {useResponseErrors} from '@/hooks/useResponseErrors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {AppLogo} from '@/components/blocks/AppLogo/AppLogo';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {ThemedInputError} from '@/components/blocks/ThemedInputError/ThemedInputError';
import {api} from '../../../../utils/api';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';

const ASYNC_STORAGE_KEY = 'auth_login';
export const LoginScreen: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const router = useRouter();
  const {getError, setErrors} = useResponseErrors();

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEY).then((result) => {
      if (result) {
        setEmail(result);
      }
    });
  }, []);

  const performLogin = async () => {
    setLoading(true);
    const result = await api.login({
      body: {email, password},
      timeout: 5000,
    });
    setLoading(false);

    if (result.error) {
      const err: LoginError = result.error;
      console.log(result);
      if (err.error.code === 'ValidationFailed') {
        setErrors(err.error.fieldErrors ?? []);
      } else if (err.error.code === 'ActionError') {
        Alert.alert('Login failed', err.error.humanReadable);
      } else {
        Alert.alert('Error', 'Something went wrong.');
      }
      return;
    }
    AsyncStorage.setItem(ASYNC_STORAGE_KEY, email);
    await auth.login(result.data);
    router.navigate('/');
  };

  return (
    <AppScreenContainer className="h-full p-m pt-xxl items-center justify-center" safeTop={true}>
      <Stack.Screen options={{title: 'Sign In', headerShown: false}} />
      <AppLogo />
      <ThemedView className="mt-s p-xxl w-full">
        <ThemedText className="mb-s">Email:</ThemedText>
        <ThemedTextInput
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          placeholder="your@email.com"
        />
        <ThemedInputError error={getError('email')} />
        <ThemedText className="mb-s mt-s">Password:</ThemedText>
        <ThemedTextInput
          textContentType="password"
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
          value={password}
          placeholder="******"
        />
        <ThemedInputError error={getError('password')} />
        <View className="flex-col items-center mt-s">
          <ThemedLink href={'/auth/passwordRestore'}>I forgot my password</ThemedLink>
        </View>
        <View className="mt-xxl">
          <ThemedButton onPress={performLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </ThemedButton>
        </View>
        <View className="flex-row items-center justify-center gap-s mt-xxl">
          <ThemedText>New to Discipline? </ThemedText>
          <ThemedLink href={'/auth/register'}>Sign Up</ThemedLink>
        </View>
      </ThemedView>
      </AppScreenContainer>
  );
};
