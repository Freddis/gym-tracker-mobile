/* eslint-disable react-hooks/rules-of-hooks */
import {useDrizzle} from '../drizzle';
import {WorkoutService} from './WorkoutService';

const [db] = useDrizzle();
const service = new WorkoutService(db);
export const useWorkoutService = (): [WorkoutService] => {
  return [service];
};
