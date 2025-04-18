import {AppExercise} from '@/types/models/AppExercise';

export interface ExerciseBlockProps {
  nested?: boolean,
  onPress?: (item: AppExercise) => void
  item: AppExercise & {variations?: AppExercise[]}
}
