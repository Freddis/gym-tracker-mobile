import {Exercise} from '@/openapi-client';
import {AppWorkoutExerciseSet} from '../../../types/models/AppWorkoutExerciseSet';

export interface ExerciseHistory {
  exercise: Exercise;
  history: AppWorkoutExerciseSet[];
};
