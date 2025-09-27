import React from 'react';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {SelectExerciseScreen} from '@/components/screens/exercises/SelectExerciseScreen/SelectExerciseScreen';
import {Exercise} from '../../../openapi-client';

export default function SelectExercise() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const select = (exercise: Exercise) => {
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
