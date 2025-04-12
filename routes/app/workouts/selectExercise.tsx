import React from 'react';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {AppExercise} from '@/types/models/AppExercise';
import {SelectExercisePage} from '@/components/SelectExercisePage/SelectExercisePage';

export default function SelectExercise() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const select = (exercise: AppExercise) => {
    router.dismissTo({
      pathname: './addWorkout',
      params: {
        ...params,
        exerciseId: exercise.id,
      }
    })
  }

  return [
    <Stack.Screen key='1' options={{ title: "Add Exercise To Workout", headerShown: true }} />,
    <SelectExercisePage key='2' onSelect={select} />
  ]
};
