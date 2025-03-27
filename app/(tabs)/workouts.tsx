import { StyleSheet, ScrollView, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{paddingTop: 70}}>
          <ThemedText type="title">Workouts & Plans</ThemedText>
          <Link href={'/exercises/addExercise'} asChild>
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
