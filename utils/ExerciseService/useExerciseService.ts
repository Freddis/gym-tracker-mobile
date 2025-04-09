import {ExerciseService} from "./ExerciseService";

const service = new ExerciseService();

export const useExerciseService = (): [ExerciseService] => {
    return [service]
}