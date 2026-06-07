import {StyleSheet, Text, FlatList, View} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {FC} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';

export const WorkoutTypeListScreen: FC = () => {
  const {workoutTypeService} = useServices();
  const query = useQuery({
    queryFn: () => workoutTypeService.getPage(),
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
