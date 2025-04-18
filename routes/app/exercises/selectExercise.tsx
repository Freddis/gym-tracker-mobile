import React from 'react';
import {Stack, useRouter} from 'expo-router';
import {AppExercise} from '@/types/models/AppExercise';
import {SelectExerciseScreen} from '@/components/screens/exercises/SelectExerciseScreen/SelectExerciseScreen';

export default () => {
  const router = useRouter();
  const select = (exercise: AppExercise) => {
    router.dismissTo({
      pathname: '/app/exercises/addExercise',
      params: {
        exerciseId: exercise.id,
      },
    });
  };

  return [
    <Stack.Screen key="1" options={{title: 'Exercise Library', headerShown: true}} />,
    <SelectExerciseScreen key="2" onSelect={select} />,
  ];
};
