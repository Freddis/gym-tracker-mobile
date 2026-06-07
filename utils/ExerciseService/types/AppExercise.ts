import {Exercise} from '../../../openapi-client';

export interface AppExercise extends Omit<Exercise, 'variations'> {
  lastPulledAt: Date | null;
  lastPushedAt: Date | null;
}
