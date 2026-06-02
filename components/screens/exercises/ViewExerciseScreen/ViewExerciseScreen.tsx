import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {FC} from 'react';
import {useQuery} from '@tanstack/react-query';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {string} from 'zod';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ViewExercisePresenter} from '../common/ViewExercisePresenter/ViewExercisePresenter';

export const ViewExerciseScreen: FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const {workoutService} = useServices();
  const validated = string().safeParse(params.exerciseId);
  const exerciseId = validated.success ? validated.data : '';

  const result = useQuery({
    queryFn: () => workoutService.getExerciseHistory(exerciseId),
    queryKey: ['exercises', exerciseId],
  });
  const data = result.data;
  if (!data) {
    return <LoadingBlock />;
  }
  const exercise = data.exercise;
  const history = data.history;

  const onEditPress = () => {
    router.navigate({
      pathname: '/app/exercises/editExercise',
      params: {
        exerciseId: exercise.id,
      },
    });
  };
  const headerRight = () => {
    if (exercise.userId) {
      return <ThemedLink onPress={onEditPress}>Edit</ThemedLink>;
    }
    return null;
  };
  return (
    <>
      <Stack.Screen options={{title: `${exercise.name}`, headerShown: true, headerRight}}/>
      <ViewExercisePresenter exercise={exercise} history={history} />
    </>
  );
};
