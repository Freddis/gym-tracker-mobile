import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import {FC, useState} from 'react';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {AppLogo} from '@/components/blocks/AppLogo/AppLogo';
import {useResponseErrors} from '@/hooks/useResponseErrors';
import {ThemedInputError} from '@/components/blocks/ThemedInputError/ThemedInputError';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';

export const RegistrationScreen: FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage] = useResponseErrors();
  const router = useRouter();

  const performRegistration = () => {
    // TODO: implement registration logic
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{title: 'Sign up', headerShown: true}} />
      <View style={styles.logoWrapper}>
        <AppLogo horizontal />
      </View>
      <ThemedView style={styles.form}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <ThemedTextInput onChangeText={setLogin} value={login} placeholder="John Snow" />
        <ThemedInputError error={errorMessage('password')} />

        <ThemedText style={styles.label}>Email</ThemedText>
        <ThemedTextInput onChangeText={setLogin} value={login} placeholder="your@email.com" />
        <ThemedInputError error={errorMessage('password')} />

        <ThemedText style={styles.label}>Password</ThemedText>
        <ThemedTextInput onChangeText={setPassword} value={password} placeholder="******" />
        <ThemedInputError error={errorMessage('password')} />

        <ThemedText style={styles.label}>Password Confirmation</ThemedText>
        <ThemedTextInput onChangeText={setPassword} value={password} placeholder="******" />
        <ThemedInputError error={errorMessage('password')} />

        <ThemedButton onPress={performRegistration} style={styles.submitButton}>
          Sign Up
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 50,
    marginTop: 40,
  },
  label: {
    marginBottom: 5,
  },
  submitButton: {
    marginTop: 30,
  },
});
