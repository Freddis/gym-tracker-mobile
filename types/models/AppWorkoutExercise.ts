import {schema} from '@/db/schema';
import {AppWorkoutExerciseSet} from './AppWorkoutExerciseSet';
import {ExerciseRow} from './ExerciseRow';

export type AppWorkoutExercise = typeof schema.workoutExercises.$inferSelect
export type CompleteAppWorkoutExercise = AppWorkoutExercise & {
  sets: AppWorkoutExerciseSet[]
  exercise: ExerciseRow
}
