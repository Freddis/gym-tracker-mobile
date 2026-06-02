import {Stack} from 'expo-router';
import {FC} from 'react';
import {ViewExercisePresenter} from '../../../exercises/common/ViewExercisePresenter/ViewExercisePresenter';
import {useAtom} from 'jotai';
import {exerciseHistoryAtom} from './utils/exerciseHistoryAtom';

export const ExerciseHistoryScreen: FC = () => {
  const [historyAtom] = useAtom(exerciseHistoryAtom);
  const [history] = useAtom(historyAtom);
  return (
    <>
      <Stack.Screen options={{title: `${history.exercise.name}`, headerShown: true}}/>
      <ViewExercisePresenter exercise={history.exercise} history={history.history} />
    </>
  );
};
