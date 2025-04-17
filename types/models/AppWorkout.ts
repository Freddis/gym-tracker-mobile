import {schema} from '@/db/schema';
import {CompleteAppWorkoutExercise} from './AppWorkoutExercise';

export type AppWorkout = typeof schema.workouts.$inferSelect
export type CompleteAppWorkout = AppWorkout & {
  exercises: CompleteAppWorkoutExercise[]
}
