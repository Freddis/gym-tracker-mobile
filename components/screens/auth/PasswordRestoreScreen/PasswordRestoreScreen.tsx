import {Alert, StyleSheet} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack} from 'expo-router';
import {FC, useState} from 'react';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {AppLogo} from '@/components/blocks/AppLogo/AppLogo';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';

export const PasswordRestoreScreen: FC = () => {
  const [login, setLogin] = useState('');

  const onSendPress = () => {
    Alert.alert('Not implemented yet');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{title: 'Restore Password', headerShown: true}} />
      <ThemedView style={styles.content}>
        <AppLogo style={styles.logo} />
        <ThemedView style={styles.form}>
          <ThemedText style={styles.infoText}>
            Enter your email and we will send you new password if your account exists
          </ThemedText>
          <ThemedTextInput
            onChangeText={setLogin}
            value={login}
            placeholder="your@email.com"
          />
          <ThemedButton onPress={onSendPress} style={styles.submitButton}>
            Send
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    marginBottom: 40,
    marginTop: -50,
  },
  form: {
    paddingHorizontal: 50,
    flexDirection: 'column',
  },
  infoText: {
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 80,
  },
});
