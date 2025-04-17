import {relations} from 'drizzle-orm';
import {exercises, users, workoutExercises, workoutExerciseSets, workouts} from './schema';

export const workoutRelations = relations(workouts, (relations) => ({
  user: relations.one(users),
  sets: relations.many(workoutExerciseSets),
  exercises: relations.many(workoutExercises),
}));

export const workoutExerciseRelations = relations(workoutExercises, (relations) => ({
  workout: relations.one(workouts, {fields: [workoutExercises.workoutId], references: [workouts.id]}),
  exercise: relations.one(exercises, {fields: [workoutExercises.exerciseId], references: [exercises.id]}),
  sets: relations.many(workoutExerciseSets),
}));

export const workoutExerciseSetRelations = relations(workoutExerciseSets, (relations) => ({
  workout: relations.one(workouts, {fields: [workoutExerciseSets.workoutId], references: [workouts.id]}),
  exercise: relations.one(exercises, {fields: [workoutExerciseSets.exerciseId], references: [exercises.id]}),
  workoutExercise: relations.one(
    workoutExercises,
    {fields: [workoutExerciseSets.workoutExerciseId], references: [workoutExercises.id]}
  ),
}));
