import {FC} from 'react';
import {Stack, useRouter} from 'expo-router';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';
import {Exercise} from '../../../../openapi-client';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';

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
  <ScreenContainer safeTop={true}>
    <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
    <SelectExercisePresenter onPress={onExercisePress}/>
  </ScreenContainer>
  );
};
