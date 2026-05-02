import {EntryType, EntryVisibility, Equipment, ExternalSource, ImageType, Muscle} from '@/openapi-client';
import {index, integer, real, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  difficulty: integer(),
  equipment: text().$type<Equipment>(),
  images: text({mode: 'json'}).notNull().$type<string[]>(),
  params: text({mode: 'json'}).notNull().$type<number[]>(),
  userId: integer(),
  copiedFromId: text(),
  parentExerciseId: text(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
});

export const exerciseMuscle = sqliteTable('muscles', {
  id: integer().primaryKey().notNull(),
  exerciseId: text().notNull(),
  isPrimary: integer({mode: 'boolean'}).notNull(),
  muscle: text().notNull().$type<Muscle>(),
},
  (table) => [
    index('muscle_idx').on(table.muscle),
  ]
);

export const workouts = sqliteTable('workouts', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  typeId: integer().references(() => workoutTypes.id),
  userId: integer().notNull(),
  calories: real().notNull(),
  start: integer({mode: 'timestamp'}).notNull(),
  end: integer({mode: 'timestamp'}),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
});

export const workoutExercises = sqliteTable('workout_exercises', {
  id: integer().primaryKey().notNull(),
  workoutId: integer().notNull().references(() => workouts.id),
  exerciseId: text().notNull().references(() => exercises.id),
  userId: integer().notNull(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
});

export const workoutExerciseSets = sqliteTable('workout_exercise_sets', {
  id: integer().primaryKey().notNull(),
  exerciseId: text().notNull().references(() => exercises.id),
  workoutExerciseId: integer().notNull().references(() => workoutExercises.id),
  userId: integer().notNull(),
  workoutId: integer().notNull().references(() => workouts.id),
  start: integer({mode: 'timestamp'}),
  end: integer({mode: 'timestamp'}),
  finished: integer({mode: 'boolean'}).notNull(),
  weight: real(),
  reps: integer(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
});

export const users = sqliteTable('users', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  name: text().notNull(),
  email: text().notNull(),
  jwt: text().notNull().notNull(),
  updatedAt: integer({mode: 'timestamp'}),
});

export const workoutTypes = sqliteTable('workout_type', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  userId: integer().notNull(),
  planIndex: integer(),
  planId: integer(),
  name: text(),
  description: text(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
});

export const workoutTypeExercises = sqliteTable('workout_type_exercise', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  userId: integer().notNull(),
  index: integer().notNull(),
  workoutTypeId: integer().notNull().references(() => workoutTypes.id, {onDelete: 'cascade'}),
  exerciseId: text().notNull().references(() => exercises.id, {onDelete: 'restrict'}),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
});

export const workoutTypeExerciseSets = sqliteTable('workout_type_exercise_sets', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  reps: integer(),
  exerciseId: text().notNull().references(() => exercises.id, {onDelete: 'cascade'}),
  workoutTypeId: integer().notNull().references(() => workoutTypes.id, {onDelete: 'cascade'}),
  userId: integer().notNull(),
  workoutTypeExerciseId: integer().notNull().references(() => workoutTypeExercises.id, {onDelete: 'cascade'}),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
});

export const weight = sqliteTable('weight', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  weight: real().notNull(),
  units: text().notNull(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
});

export const entries = sqliteTable('entries', {
  id: text().primaryKey(),
  type: text().notNull().$type<EntryType>(),
  title: text(),
  note: text(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  workoutId: integer().references(() => workouts.id, {onDelete: 'cascade'}),
  imageId: integer().references(() => images.id, {onDelete: 'cascade'}),
  weightId: integer().references(() => weight.id, {onDelete: 'cascade'}),
  outdoorRunId: integer().references(() => outdoorRuns.id, {onDelete: 'cascade'}),
  outdoorWalkId: integer().references(() => outdoorWalks.id, {onDelete: 'cascade'}),
  visibility: text().notNull().$type<EntryVisibility>(),
  time: integer({mode: 'timestamp'}).notNull(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
  externalId: text(),
  externalSource: text().$type<ExternalSource>(),
  healthkitId: text(),
  healthkitAnchor: integer(),
  healthkitAnchors_3_0: text(),
  healthkitSource: text(),
  healthkitSourceName: text(),
  healthkitDevice: text(),
  healthkitDeviceName: text(),
});

export const images = sqliteTable('images', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  url: text(),
  image: text(),
  type: text().notNull().$type<ImageType>(),
  // lastPulledAt: integer({mode: 'timestamp'}),
  // lastPushedAt: integer({mode: 'timestamp'}),
});

export const outdoorRuns = sqliteTable('outdoor_runs', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  distance: real().notNull(),
  pace: real().notNull(),
  maxPace: real().notNull(),
  cadence: real(),
  maxCadence: real(),
  elevationGain: real(),
  heartRate: real(),
  maxHeartRate: real(),
  duration: integer().notNull(),
  calories: integer().notNull(),
  start: integer({mode: 'timestamp'}).notNull(),
  end: integer({mode: 'timestamp'}).notNull(),
});

export const outdoorWalks = sqliteTable('outdoor_walks', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  distance: real().notNull(),
  pace: real().notNull(),
  maxPace: real().notNull(),
  cadence: real(),
  maxCadence: real(),
  elevationGain: real(),
  heartRate: real(),
  maxHeartRate: real(),
  duration: integer().notNull(),
  calories: integer().notNull(),
  start: integer({mode: 'timestamp'}).notNull(),
  end: integer({mode: 'timestamp'}).notNull(),
});

export const outdoorWalkGeoData = sqliteTable('outdoor_walk_geo_data', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  outdoorWalkId: integer().notNull().references(() => outdoorWalks.id, {onDelete: 'cascade'}),
  latitude: real().notNull(),
  longitude: real().notNull(),
  altitude: real().notNull(),
  course: real(),
  speed: real(),
  speedAccuracy: real(),
  horizontalAccuracy: real(),
  verticalAccuracy: real(),
  distance: real(),
  timestamp: integer().notNull(),
});

export const outdoorWalkHeartrateData = sqliteTable('outdoor_walk_heartrate_data', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  outdoorWalkId: integer().notNull().references(() => outdoorWalks.id, {onDelete: 'cascade'}),
  timestamp: integer().notNull(),
  heartRate: real().notNull(),
});

export const outdoorRunGeoData = sqliteTable('outdoor_run_geo_data', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  outdoorRunId: integer().notNull().references(() => outdoorRuns.id, {onDelete: 'cascade'}),
  latitude: real().notNull(),
  longitude: real().notNull(),
  altitude: real().notNull(),
  course: real(),
  speed: real(),
  speedAccuracy: real(),
  horizontalAccuracy: real(),
  verticalAccuracy: real(),
  distance: real(),
  timestamp: integer().notNull(),
});

export const outdoorRunHeartrateData = sqliteTable('outdoor_run_heartrate_data', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  outdoorRunId: integer().notNull().references(() => outdoorRuns.id, {onDelete: 'cascade'}),
  timestamp: integer().notNull(),
  heartRate: real().notNull(),
});
