import {useFocusEffect, useRouter} from 'expo-router';
import {useContext} from 'react';
import {AuthContext} from '@/components/AuthProvider/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext)
  useFocusEffect(() => {
    if(!auth.user){
      router.replace('/auth/login');
      return
    }
    router.replace('/app/workouts/list')
  });
  
  return null
}
