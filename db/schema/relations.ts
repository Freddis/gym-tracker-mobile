import {relations} from 'drizzle-orm';
import {entries, exercises, images, users, weight, workoutExercises, workoutExerciseSets, workouts} from './schema';

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

export const entryRelations = relations(entries, (relations) => ({
  user: relations.one(users),
  workout: relations.one(workouts, {fields: [entries.workoutId], references: [workouts.id]}),
  weight: relations.one(weight, {fields: [entries.weightId], references: [weight.id]}),
  image: relations.one(images, {fields: [entries.imageId], references: [images.id]}),
}));
