import {useEffect} from 'react';
import {Stack, useRouter} from 'expo-router';
import {useAtom} from 'jotai';
import {Exercise} from '../../../../openapi-client';
import {queryClient} from '../../../../routes/_layout';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {exerciseAtom} from '../exerciseAtom';
import {ExerciseUpdateForm} from '../ExerciseUpdateForm/ExerciseUpdateForm';

export const ExerciseUpdateScreen = () => {
  const [selectedExerciseAtom] = useAtom(exerciseAtom);
  const [exercise, setExercise] = useAtom(selectedExerciseAtom);
  const {exerciseService} = useServices();
  const {user} = useAuth();
  const router = useRouter();

  // the exercise view underneath loads its own copy, it's refreshed once the editing is done
  useEffect(() => () => {
    queryClient.invalidateQueries({queryKey: ['exercises', exercise.id]});
  }, [exercise.id]);

  if (!user) {
    throw new Error('No user');
  }

  const onChange = async (nextExercise: Exercise, image?: string | null) => {
    const result = await exerciseService.updateExercise(nextExercise, image);
    setExercise({...exercise, ...result, variations: exercise.variations});
  };

  const onDelete = async () => {
    await exerciseService.deleteExercise(exercise.id);
    await queryClient.invalidateQueries({queryKey: ['exercises']});
    router.dismissTo('/app/exercises/list');
  };

  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Exercise Update', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ExerciseUpdateForm key={exercise.id} exercise={exercise} onChange={onChange} onDelete={onDelete} />
    </AppScreenContainer>
  );
};
