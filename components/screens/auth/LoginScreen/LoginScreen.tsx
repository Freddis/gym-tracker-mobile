import {Alert, StyleSheet, View} from 'react-native';
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
import {Theme} from '../../../../types/Colors';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {api} from '../../../../utils/api';

const ASYNC_STORAGE_KEY = 'auth_login';

export const LoginScreen: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const router = useRouter();
  const theme = useAppTheme();
  const [errorMessage, setErrors] = useResponseErrors();

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

  const styles = getStyles(theme);
  return (
    <ThemedView style={[styles.container]}>
      <Stack.Screen options={{title: 'Sign In', headerShown: false}} />
      <AppLogo />
      <ThemedView style={styles.form}>
        <ThemedText style={styles.label}>Email:</ThemedText>
        <ThemedTextInput
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          placeholder="your@email.com"
        />
        <ThemedInputError error={errorMessage('email')} />
        <ThemedText style={styles.passwordLabel}>Password:</ThemedText>
        <ThemedTextInput
          textContentType="password"
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
          value={password}
          placeholder="******"
        />
        <ThemedInputError error={errorMessage('password')} />
        <View style={styles.forgotPassword}>
          <ThemedLink href={'/auth/passwordRestore'}>I forgot my password</ThemedLink>
        </View>
        <View style={styles.signInButton}>
          <ThemedButton onPress={performLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </ThemedButton>
        </View>

        <View style={styles.signUpRow}>
          <ThemedText>New to Discipline? </ThemedText>
          <ThemedLink href={'/auth/register'}>Sign Up</ThemedLink>
        </View>
      </ThemedView>
    </ThemedView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  form: {
    paddingHorizontal: 50,
    marginTop: 50,
  },
  label: {
    marginBottom: theme.marginS,
  },
  passwordLabel: {
    marginBottom: theme.marginS,
    marginTop: 20,
  },
  forgotPassword: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  signInButton: {
    marginTop: 40,
  },
  signUpRow: {
    marginTop: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
