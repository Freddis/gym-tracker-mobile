import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {FC} from 'react';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom, useAtomValue} from 'jotai';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {string} from 'zod';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ViewExercisePresenter} from '../common/ViewExercisePresenter/ViewExercisePresenter';
import {exerciseAtom} from '../exerciseAtom';
import {NestedAppExercise} from '../../../../utils/ExerciseService/types/NestedAppExercise';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';

export const ViewExerciseScreen: FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const {workoutService} = useServices();
  const [selectedExerciseAtom, setSelectedExerciseAtom] = useAtom(exerciseAtom);
  const selectedExercise = useAtomValue(selectedExerciseAtom);
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
    if (selectedExercise.id !== exercise.id) {
      // opened without going through the library, so there is no list row to write the changes into
      const detached: NestedAppExercise = {...exercise, variations: [], lastPulledAt: null, lastPushedAt: null};
      setSelectedExerciseAtom(atom(detached));
    }
    router.navigate({
      pathname: '/app/exercises/editExercise',
      params: {
        exerciseId: exercise.id,
      },
    });
  };
  const headerLeft = () => <BackHeaderButton />;
  const headerRight = () => {
    if (exercise.userId) {
      return <ThemedLink onPress={onEditPress}>Edit</ThemedLink>;
    }
    return null;
  };
  return (
    <>
      <Stack.Screen options={{title: `${exercise.name}`, headerShown: true, headerLeft, headerRight}}/>
      <ViewExercisePresenter exercise={exercise} history={history} />
    </>
  );
};
