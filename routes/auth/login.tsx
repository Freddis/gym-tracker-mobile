import { Button } from 'react-native';
import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";
import {Link, Stack, useRouter} from "expo-router";
import {useContext, useState} from 'react';
import {ThemedTextInput} from '@/components/ThemedInput';
import {postAuthLogin} from '@/openapi-client';
import {AuthContext} from '@/components/AuthProvider/AuthContext';

export default function LoginPage() {
  const [login,setLogin] = useState('')
  const [password,setPassword] = useState('')
  const auth = useContext(AuthContext);
  const router = useRouter();
  const performLogin = async () => {
    const result = await postAuthLogin({
      body: {
        email: login,
        password,
      }
    })
    if(result.error){
      const err = result.error;
      console.log(err)
      alert("Something went wrong:")
      return;
    }
    auth.login(result.data)
    router.navigate('/');
  }
  return (
    <ThemedView style={{flex: 1 }}>
      <Stack.Screen options={{ title: "Login", headerShown: false }} />
      <ThemedText style={{paddingTop: 70, textAlign: "center"}}> Gym Tracker</ThemedText>
      <ThemedView style={{padding: 20}}>
        <ThemedText>Email</ThemedText>
        <ThemedTextInput autoCapitalize='none' onChangeText={setLogin}  value={login} placeholder="your@email.com"/>
        <ThemedText>Password</ThemedText>
        <ThemedTextInput secureTextEntry autoCapitalize='none' onChangeText={setPassword}  value={password}  placeholder="******" />
        <Button onPress={performLogin} title='Sign In'/>
        <Link href={'./register'} push  asChild>
          <Button title="Sign Up"></Button>
        </Link>
      </ThemedView>
    </ThemedView>
  )
}