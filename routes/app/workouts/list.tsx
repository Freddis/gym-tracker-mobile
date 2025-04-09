import { StyleSheet, Button, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {getWorkoutsOptions} from '@/openapi-client/@tanstack/react-query.gen';
import {WorkoutBlock} from '@/components/WorkoutBlock/WorkoutBlock';
import {LoadingBlock} from '@/components/LoadingBlock/LoadingBlock';

export default function WorkoutList() {
  const query = useQuery(getWorkoutsOptions())
  if(query.isLoading){
    return  <LoadingBlock />
  }
  const workouts = query.data?.items

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
