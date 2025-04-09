import { Button } from 'react-native';
import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";
import {Link, Stack, useRouter} from "expo-router";
import {useContext, useEffect, useState} from 'react';
import {ThemedTextInput} from '@/components/ThemedInput';
import {postAuthLogin, PostAuthLoginError} from '@/openapi-client';
import {AuthContext} from '@/components/AuthProvider/AuthContext';
import {useResponseErrors} from '@/hooks/useResponseErrors';
import {openApiRequest} from '@/utils/openApiRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginPage() {
  const ASYNC_STORAGE_KEY = 'auth_login';
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [errorMessage,setErrors] = useResponseErrors()
  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEY).then((result) => {
      if(result){
        setEmail(result)
      }
    })
  },[])
  const performLogin = async () => {
    console.log("sending")
    const result = await openApiRequest(postAuthLogin,{
      body: {
        email,
        password
      }
    })
    if(result.error){
      const err: PostAuthLoginError = result.error;
      if(err.error.code === 'validationFailed'){
        setErrors(err.error.fieldErrors ?? [])
      }
      else {
        alert("Something went wrong:")
      }
      return;
    }
    AsyncStorage.setItem(ASYNC_STORAGE_KEY,email);
    auth.login(result.data)
    router.navigate('/');
  }
  return (
    <ThemedView style={{flex: 1 }}>
      <Stack.Screen options={{ title: "Login", headerShown: false }} />
      <ThemedText style={{paddingTop: 70, textAlign: "center"}}>Gym Tracker</ThemedText>
      <ThemedView style={{padding: 20}}>
        <ThemedText>Email</ThemedText>
        <ThemedTextInput keyboardType='email-address' textContentType='emailAddress' autoCapitalize='none' onChangeText={setEmail}  value={email} placeholder="your@email.com"/>
        {errorMessage('email') && (
          <ThemedText style={{color: 'red'}}>{errorMessage('email')}</ThemedText>
        )}
        <ThemedText>Password</ThemedText>
        <ThemedTextInput textContentType='password' secureTextEntry autoCapitalize='none' onChangeText={setPassword}  value={password}  placeholder="******" />
        {errorMessage('password') && (
          <ThemedText style={{color: 'red'}}>{errorMessage('password')}</ThemedText>
        )}
        <Button onPress={performLogin} title='Sign In'/>
        <Link href={'./register'} push  asChild>
          <Button title="Sign Up"></Button>
        </Link>
      </ThemedView>
    </ThemedView>
  )
}