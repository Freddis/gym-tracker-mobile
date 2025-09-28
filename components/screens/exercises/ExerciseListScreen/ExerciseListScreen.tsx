import {StyleSheet} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {FC} from 'react';
import {Stack, useRouter} from 'expo-router';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';
import {Exercise} from '../../../../openapi-client';

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 70,
    paddingHorizontal: 0,
    flex: 1,
  },
});

export const ExerciseListScreen: FC = () => {
  const router = useRouter();
  const onExercisePress = (exercise:Exercise) => {
    router.navigate({
      pathname: '/app/exercises/viewExercise',
      params: {
        exerciseId: exercise.id,
      },
    });
  };
  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
          <SelectExercisePresenter onPress={onExercisePress}/>
      </ThemedView>
  );
};
