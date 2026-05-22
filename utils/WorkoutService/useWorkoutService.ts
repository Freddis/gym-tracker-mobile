import {useDrizzle} from '../drizzle';
import {WorkoutService} from './WorkoutService';

// eslint-disable-next-line react-hooks/rules-of-hooks
const [db] = useDrizzle();
const service = new WorkoutService(db);
export const useWorkoutService = (): [WorkoutService] => {
  return [service];
};
