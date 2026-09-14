import {schema} from '@/db/schema';
import {AppWorkoutExerciseSet} from './AppWorkoutExerciseSet';
import {Exercise} from '../../openapi-client';

export type AppWorkoutExercise = typeof schema.workoutExercises.$inferSelect
export type CompleteAppWorkoutExercise = AppWorkoutExercise & {
  sets: AppWorkoutExerciseSet[]
  exercise: Exercise
}
