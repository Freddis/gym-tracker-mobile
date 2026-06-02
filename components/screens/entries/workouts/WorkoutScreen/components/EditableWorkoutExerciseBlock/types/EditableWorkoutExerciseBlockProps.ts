import {CompleteAppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {PrimitiveAtom} from 'jotai';

export interface EditableWorkoutExerciseBlockProps {
  exercise: PrimitiveAtom<CompleteAppWorkoutExercise>
  onDelete: (exercise: CompleteAppWorkoutExercise) => void
}
