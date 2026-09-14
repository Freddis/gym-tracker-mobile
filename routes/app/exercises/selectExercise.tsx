import React from 'react';
import {Stack, useRouter} from 'expo-router';
import {useSetAtom} from 'jotai';
import {SelectExerciseScreen} from '@/components/screens/exercises/SelectExerciseScreen/SelectExerciseScreen';
import {Exercise} from '../../../openapi-client';
import {copiedExerciseAtom} from '../../../components/screens/exercises/copiedExerciseAtom';

export default () => {
  const router = useRouter();
  const setCopiedExercise = useSetAtom(copiedExerciseAtom);
  const select = (exercise: Exercise) => {
    setCopiedExercise(exercise);
    router.back();
  };

  return [
    <Stack.Screen key="1" options={{title: 'Exercise Library', headerShown: true}} />,
    <SelectExerciseScreen key="2" onSelect={select} />,
  ];
};
