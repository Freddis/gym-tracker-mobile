/* eslint-disable react-hooks/rules-of-hooks */
import {useEntryService} from '../EntryService/useEntryService';
import {useExerciseService} from '../ExerciseService/useExerciseService';
import {useWeightService} from '../WeightService/useWeightService';
import {useWorkoutService} from '../WorkoutService/useWorkoutService';
import {WorkoutTypeService} from '../WorkoutTypeService/WorkoutTypeService';
import {SyncService} from './SyncService';

const [workouts] = useWorkoutService();
const [exercises] = useExerciseService();
const [weight] = useWeightService();
const [entry] = useEntryService();
const service = new SyncService(workouts, exercises, new WorkoutTypeService(exercises), weight, entry);
export const useSyncService = ():[SyncService] => {
  return [service];
};
