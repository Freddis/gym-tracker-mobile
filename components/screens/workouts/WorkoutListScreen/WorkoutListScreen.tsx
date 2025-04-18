import {StyleSheet, Button, FlatList} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Link, Stack, useNavigation, useRouter} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {useDrizzle} from '@/utils/drizzle';
import {FC, useState} from 'react';
import {AppWorkout} from '@/types/models/AppWorkout';
import {WorkoutBlock} from './components/WorkoutBlock/WorkoutBlock';

export const WorkoutListScreen: FC = () => {
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const router = useRouter();
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle();
  const sqlQuery = db.query.workouts.findMany({
    with: {
      exercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (t, op) => [
              op.asc(t.createdAt),
            ],
          },
        },
        orderBy: (t, op) => [
          op.asc(t.createdAt),
        ],
      },
    },
    where: (t, op) => op.and(
      op.isNull(t.deletedAt)
    ),
    orderBy: (t, op) => op.desc(t.start),
    limit: 50,
  });
  const query = useLiveQuery(sqlQuery, [focusedCounter]);
  if (!query.data) {
    return <LoadingBlock />;
  }
  const workouts = query.data;
  const openWorkout = (workout: AppWorkout) => {
    router.navigate({
      pathname: './editWorkout',
      params: {
        workoutId: workout.id,
      },
    });
  };
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{title: 'Workout List', headerShown: false}} />
      <ThemedText type="title" style={{padding: 10}}>Workouts & Plans</ThemedText>
      <Link href={'./editWorkout'} asChild>
        <Button title="New Workout"></Button>
      </Link>
      <FlatList data={workouts} style={styles.list} renderItem={(x) => <WorkoutBlock onPress={openWorkout} workout={x.item}/>} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  list: {
    padding: 10,
  },
});
