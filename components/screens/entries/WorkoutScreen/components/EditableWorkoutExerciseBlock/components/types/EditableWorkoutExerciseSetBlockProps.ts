import {AppWorkoutExerciseSet} from '@/types/models/AppWorkoutExerciseSet';
import {PrimitiveAtom} from 'jotai';

export interface EditableWorkoutExerciseSetBlockProps {
  index: number,
  set: PrimitiveAtom<AppWorkoutExerciseSet>,
  onDelete: (set: AppWorkoutExerciseSet)=> void
}
