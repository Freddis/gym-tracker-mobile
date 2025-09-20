import {Button, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Link, Stack, useRouter} from 'expo-router';
import {FC, useContext, useEffect, useState} from 'react';
import {postAuthLogin, PostAuthLoginError} from '@/openapi-client';
import {AuthContext} from '@/components/providers/AuthProvider/AuthContext';
import {useResponseErrors} from '@/hooks/useResponseErrors';
import {openApiRequest} from '@/utils/openApiRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {AppLogo} from '@/components/elements/AppLogo/AppLogo';
import {useThemeColor} from '@/hooks/useThemeColor';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';

export const LoginScreen: FC = () => {
  const ASYNC_STORAGE_KEY = 'auth_login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useContext(AuthContext);
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const [errorMessage, setErrors] = useResponseErrors();
  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEY).then((result) => {
      if (result) {
        setEmail(result);
      }
    });
  }, []);
  const performLogin = async () => {
    const result = await openApiRequest(postAuthLogin, {
      body: {
        email,
        password,
      },
    });
    if (result.error) {
      const err: PostAuthLoginError = result.error;
      if (err.error.code === 'ValidationFailed') {
        setErrors(err.error.fieldErrors ?? []);
      } else if (err.error.code === 'ActionError') {
        alert(err.error.humanReadable);
      } else {
        alert('Something went wrong:');
      }
      return;
    }
    AsyncStorage.setItem(ASYNC_STORAGE_KEY, email);
    auth.login(result.data);
    router.navigate('/');
  };
  return (
    <ThemedView style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor, height: '100%'}}>
      <Stack.Screen options={{title: 'Login', headerShown: false}} />
      <AppLogo />
      <ThemedView style={{paddingHorizontal: 50, marginTop: 50}}>
        <ThemedText style={{marginBottom: 5}}>Email:</ThemedText>
        <ThemedTextInput
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          placeholder="your@email.com"
        />
        <ThemedText style={{color: 'red', opacity: errorMessage('email') ? 100 : 0}}>{errorMessage('email')}</ThemedText>
        <ThemedText style={{marginBottom: 5, marginTop: 20}}>Password:</ThemedText>
        <ThemedTextInput
          textContentType="password"
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
          value={password}
          placeholder="******"
        />
        <ThemedText style={{color: 'red', opacity: errorMessage('password') ? 100 : 0}}>{errorMessage('password')}</ThemedText>
        <View>
          <Button title="I forgot my password" color={'red'}/>
        </View>
        <View style={{marginTop: 40}}>
          <ThemedButton onPress={performLogin}>Sign In</ThemedButton>
        </View>
        <View style={{marginTop: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <ThemedText>New to Discipline?</ThemedText>
         <Link href={'./register'} push asChild >
          <Button title="Sign Up" color={'red'}/>
          </Link>
        </View>
      </ThemedView>
    </ThemedView>
  );
};
