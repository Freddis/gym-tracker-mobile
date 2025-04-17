import {Exercise, WorkoutExerciseSet} from '@/openapi-client';

export type ExerciseWithSets = {
  exercise: Exercise,
  sets: WorkoutExerciseSet[]
}
