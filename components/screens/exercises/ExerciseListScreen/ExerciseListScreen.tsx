import {FC} from 'react';
import {Stack, useRouter} from 'expo-router';
import {PrimitiveAtom, useSetAtom} from 'jotai';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {NestedAppExercise} from '../../../../utils/ExerciseService/types/NestedAppExercise';
import {exerciseAtom} from '../exerciseAtom';

export const ExerciseListScreen: FC = () => {
  const router = useRouter();
  const setSelectedExercise = useSetAtom(exerciseAtom);
  const onExercisePress = (exercise: NestedAppExercise, itemAtom: PrimitiveAtom<NestedAppExercise>) => {
    // the update screen writes into this atom, so the list row reflects the changes
    setSelectedExercise(itemAtom);
    router.navigate({
      pathname: '/app/exercises/viewExercise',
      params: {
        exerciseId: exercise.id,
      },
    });
  };
  return (
  <AppScreenContainer safeTop={true} className="h-full">
    <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
    <SelectExercisePresenter onPress={onExercisePress}/>
  </AppScreenContainer>
  );
};
