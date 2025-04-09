import { StyleSheet, Button, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, useNavigation } from 'expo-router';
import {WorkoutBlock} from '@/components/WorkoutBlock/WorkoutBlock';
import {LoadingBlock} from '@/components/LoadingBlock/LoadingBlock';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {useDrizzle} from '@/utils/drizzle';
import {useState} from 'react';

export default function WorkoutList() {
  const navigation = useNavigation();
    navigation.addListener('focus', () => {
      setfocusedCounter(focusedCounter + 1);
    });  
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle()
  const sqlQuery = db.query.workouts.findMany({
    with: {
      sets: {
        with: {
          exercise: true
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

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{padding: 10}}>Workouts & Plans</ThemedText>
      <Link href={'./addWorkout'} asChild>
        <Button title='New Workout'></Button>
      </Link>
      <FlatList data={workouts} style={styles.list} renderItem={(x) => <WorkoutBlock workout={x.item}/>} ></FlatList>
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
