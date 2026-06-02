import {Exercise} from '@/openapi-client';
import {ExerciseHistoryRow} from './ExerciseHistoryRow';

export interface ExerciseHistory {
  exercise: Exercise;
  history: ExerciseHistoryRow[];
};
