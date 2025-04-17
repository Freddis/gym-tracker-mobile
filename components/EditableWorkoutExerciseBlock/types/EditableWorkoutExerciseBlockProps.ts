import {CompleteAppWorkoutExercise} from '@/types/models/AppWorkoutExercise';

export interface EditableWorkoutExerciseBlockProps {
  exercise: CompleteAppWorkoutExercise
  onDelete: (exercise: CompleteAppWorkoutExercise) => void
}
