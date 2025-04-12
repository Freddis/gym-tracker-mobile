import { StyleSheet, Button, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, Stack, useNavigation, useRouter } from 'expo-router';
import {WorkoutBlock} from '@/components/WorkoutBlock/WorkoutBlock';
import {LoadingBlock} from '@/components/LoadingBlock/LoadingBlock';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {useDrizzle} from '@/utils/drizzle';
import {useState} from 'react';
import {AppWorkout} from '@/types/models/AppWorkout';

export default function WorkoutList() {
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const router = useRouter()
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle()
  const sqlQuery = db.query.workouts.findMany({
    with: {
     exercises: {
      with: {
        exercise: true,
        sets: true
      }
     }
    },
    orderBy: (t,op) => op.desc(t.start),
    limit: 100,
  })  
  const query = useLiveQuery(sqlQuery,[focusedCounter])
  if(!query.data){
    return  <LoadingBlock />
  }
  const workouts = query.data
  const openWorkout = (workout: AppWorkout) => {
    router.navigate({
      pathname: './addWorkout',
      params: {
        workoutId: workout.id
      }
    })
  }
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: `Workout List`, headerShown: false }} />
      <ThemedText type="title" style={{padding: 10}}>Workouts & Plans</ThemedText>
      <Link href={'./addWorkout'} asChild>
        <Button title='New Workout'></Button>
      </Link>
      <FlatList data={workouts} style={styles.list} renderItem={(x) => <WorkoutBlock onPress={openWorkout} workout={x.item}/>} ></FlatList>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    flexDirection: 'column',
    gap: 8,
    flex:1
  },
  list: {
    padding: 10,
  }
});
