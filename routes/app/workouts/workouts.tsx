import { StyleSheet, ScrollView, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {getExercisesOptions} from '@/openapi-client/@tanstack/react-query.gen';

export default function TabTwoScreen() {
  const query = useQuery(getExercisesOptions())
  if(query.isLoading){
    return  (
    <ThemedView style={styles.container}>
      <ThemedText style={{paddingTop: 70}}>Loading..</ThemedText>
    </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{paddingTop: 70}}>
          <ThemedText type="title">Workouts & Plans</ThemedText>
          <Link href={'./addWorkout'} asChild>
            <Button title='Add Workout'></Button>
          </Link>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 20,
    gap: 8,
  },
});
