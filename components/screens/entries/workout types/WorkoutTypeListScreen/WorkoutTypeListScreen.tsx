import {StyleSheet, Text, FlatList, View} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {FC} from 'react';
import {WorkoutTypeService} from '@/utils/WorkoutTypeService/WorkoutTypeService';
import {ExerciseService} from '@/utils/ExerciseService/ExerciseService';
import {useQuery} from '@tanstack/react-query';

export const WorkoutTypeListScreen: FC = () => {
  const service = new WorkoutTypeService(new ExerciseService());
  const query = useQuery({
    queryFn: () => service.getPage(),
    queryKey: ['workouts'],
    retry: false,
  });

  const workouts = query.data;
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{title: 'Workout Types', headerShown: true}} />
      {!query.data && <LoadingBlock />}
      {!!workouts && <FlatList data={workouts} style={styles.list} renderItem={(x) => (
        <View>
          <Text>{x.item.id} - {x.item.name} - {x.item.deletedAt?.toString()}</Text>
        </View>
        )} />}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  list: {
    padding: 10,
  },
});
