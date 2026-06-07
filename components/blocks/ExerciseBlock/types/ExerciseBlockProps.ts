import {NestedAppExercise} from '../../../../utils/ExerciseService/types/NestedAppExercise';

export interface ExerciseBlockProps {
  nested?: boolean,
  onPress?: (item: NestedAppExercise) => void
  item: NestedAppExercise
}
