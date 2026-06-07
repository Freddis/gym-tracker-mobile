import {FC} from 'react';
import {Exercise} from '../../../../openapi-client';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {Stack} from 'expo-router';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';

export const SelectExerciseScreen: FC<{onSelect: (item: Exercise)=>void}> = (props) => {

  return (
    <AppScreenContainer>
       <Stack.Screen options={{title: 'Add Exercise', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <SelectExercisePresenter onPress={props.onSelect} />
    </AppScreenContainer>
  );
};
