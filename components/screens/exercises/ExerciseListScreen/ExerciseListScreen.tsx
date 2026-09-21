import {FC} from 'react';
import {Stack, useRouter} from 'expo-router';
import {PrimitiveAtom, useSetAtom} from 'jotai';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {NestedAppExercise} from '../../../../utils/ExerciseService/types/NestedAppExercise';
import {exerciseAtom} from '../exerciseAtom';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';

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
  const headerRight = () => <ThemedLink href="/app/exercises/addExercise">Add</ThemedLink>;
  return (
  <AppScreenContainer className="h-full">
    <Stack.Screen options={{title: 'Exercise Library', headerShown: true, headerRight}} />
    <SelectExercisePresenter onPress={onExercisePress}/>
  </AppScreenContainer>
  );
};
