/* eslint-disable react-hooks/rules-of-hooks */
import {useExerciseService} from '../ExerciseService/useExerciseService';
import {useWorkoutService} from '../WorkoutService/useWorkoutService';
import {SyncService} from './SyncService';

const [workouts] = useWorkoutService();
const [exercises] = useExerciseService();
const service = new SyncService(workouts, exercises);
export const useSyncService = ():[SyncService] => {
  return [service];
};
