import {Exercise} from '../../../../openapi-client';

export interface ExerciseBlockProps {
  nested?: boolean,
  onPress?: (item: Exercise) => void
  item: Exercise
}
