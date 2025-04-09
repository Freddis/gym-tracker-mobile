import {WorkoutService} from "./WorkoutService"

const service = new WorkoutService();

export const useWorkoutService = (): [WorkoutService] => {
  return [service]
}