import {AppWorkoutExerciseSet} from '@/types/models/AppWorkoutExerciseSet';

export interface EditableWorkoutExerciseSetBlockProps {
  index: number,
  set: AppWorkoutExerciseSet,
  onDelete: (set: AppWorkoutExerciseSet)=> void
}
