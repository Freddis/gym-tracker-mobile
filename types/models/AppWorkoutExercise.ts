import {schema} from "@/db/schema";
import {AppWorkoutExerciseSet} from "./AppWorkoutExerciseSet";
import {AppExercise} from "./AppExercise";

export type AppWorkoutExercise = typeof schema.workoutExercises.$inferSelect
export type CompleteAppWorkoutExercise = AppWorkoutExercise & {
  sets: AppWorkoutExerciseSet[]
  exercise: AppExercise
}