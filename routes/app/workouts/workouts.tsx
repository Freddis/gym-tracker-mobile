import { StyleSheet, ScrollView, Button, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {getWorkoutsOptions} from '@/openapi-client/@tanstack/react-query.gen';

export default function TabTwoScreen() {
  const query = useQuery(getWorkoutsOptions())
  if(query.isLoading){
    return  (
    <ThemedView style={styles.container}>
      <ThemedText style={{paddingTop: 70}}>Loading..</ThemedText>
    </ThemedView>
    )
  }
  const workouts = query.data?.items

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{paddingTop: 70}}>
          <ThemedText type="title">Workouts & Plans</ThemedText>
          <Link href={'./addWorkout'} asChild>
            <Button title='Add Workout'></Button>
          </Link>
          <FlatList  data={workouts} renderItem={(item) => (
            <ThemedView style={{marginBottom: 10}}>
              <ThemedText>{item.item.createdAt.toISOString()}</ThemedText>
            </ThemedView>
          )} ></FlatList>
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
