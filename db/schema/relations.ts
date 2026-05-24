import {relations} from 'drizzle-orm';
import {
  entries,
  exercises,
  food,
  foodComponents,
  images,
  mealFoodComponents,
  meals,
  outdoorRunGeoData,
  outdoorRunHeartrateData,
  outdoorRuns,
  outdoorWalkGeoData,
  outdoorWalkHeartrateData,
  outdoorWalks,
  users,
  weight,
  workoutExercises,
  workoutExerciseSets,
  workouts,
} from './schema';

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
  outdoorRun: relations.one(outdoorRuns, {fields: [entries.outdoorRunId], references: [outdoorRuns.id]}),
  outdoorWalk: relations.one(outdoorWalks, {fields: [entries.outdoorWalkId], references: [outdoorWalks.id]}),
}));

export const outdoorRunGeoDataRelations = relations(outdoorRunGeoData, (relations) => ({
  outdoorRun: relations.one(outdoorRuns, {fields: [outdoorRunGeoData.outdoorRunId], references: [outdoorRuns.id]}),
}));

export const outdoorRunHeartrateDataRelations = relations(outdoorRunHeartrateData, (relations) => ({
  outdoorRun: relations.one(outdoorRuns, {fields: [outdoorRunHeartrateData.outdoorRunId], references: [outdoorRuns.id]}),
}));

export const outdoorRunRelations = relations(outdoorRuns, (relations) => ({
  geoData: relations.many(outdoorRunGeoData),
  heartRateData: relations.many(outdoorRunHeartrateData),
}));

export const outdoorWalkRelations = relations(outdoorWalks, (relations) => ({
  geoData: relations.many(outdoorWalkGeoData),
  heartRateData: relations.many(outdoorWalkHeartrateData),
}));

export const outdoorWalkGeoDataRelations = relations(outdoorWalkGeoData, (relations) => ({
  outdoorWalk: relations.one(outdoorWalks, {fields: [outdoorWalkGeoData.outdoorWalkId], references: [outdoorWalks.id]}),
}));

export const outdoorWalkHeartrateDataRelations = relations(outdoorWalkHeartrateData, (relations) => ({
  outdoorWalk: relations.one(outdoorWalks, {fields: [outdoorWalkHeartrateData.outdoorWalkId], references: [outdoorWalks.id]}),
}));

export const foodRelations = relations(food, (relations) => ({
  image: relations.one(images, {fields: [food.imageId], references: [images.id]}),
  components: relations.many(foodComponents),
}));

export const foodComponentRelations = relations(foodComponents, (relations) => ({
  food: relations.one(food, {fields: [foodComponents.foodId], references: [food.id]}),
  // component: relations.one(food, {fields: [foodComponents.componentId], references: [food.id]}),
}));

export const mealRelations = relations(meals, (relations) => ({
  food: relations.many(mealFoodComponents),
}));

export const mealFoodComponentRelations = relations(mealFoodComponents, (relations) => ({
  meal: relations.one(meals, {fields: [mealFoodComponents.mealId], references: [meals.id]}),
  food: relations.one(food, {fields: [mealFoodComponents.foodId], references: [food.id]}),
}));
