import {Exercise} from '../../../../../openapi-client';

export interface ExerciseUpdateFormProps {
  exercise: Exercise;
  onChange: (exercise: Exercise, image?: string | null) => void;
  onDelete?: () => void;
}
