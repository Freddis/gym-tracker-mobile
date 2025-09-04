import {WorkoutTypeExerciseRow} from './WorkoutTypeExerciseRow';
import {WorkoutTypeRow} from './WorkoutTypeRow';

export interface AppWorkoutType extends WorkoutTypeRow {
  exercises: WorkoutTypeExerciseRow[]
}
