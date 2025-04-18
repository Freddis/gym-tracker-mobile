import React from 'react';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {AppExercise} from '@/types/models/AppExercise';
import {SelectExerciseScreen} from '@/components/screens/exercises/SelectExerciseScreen/SelectExerciseScreen';

export default function SelectExercise() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const select = (exercise: AppExercise) => {
    router.dismissTo({
      pathname: './editWorkout',
      params: {
        ...params,
        exerciseId: exercise.id,
      },
    });
  };

  return [
    <Stack.Screen key="1" options={{title: 'Add Exercise To Workout', headerShown: true}} />,
    <SelectExerciseScreen key="2" onSelect={select} />,
  ];
};
