import {EntryType, EntryVisibility, Equipment, ImageType, Muscle} from '@/openapi-client';
import {index, integer, real, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: integer().primaryKey().notNull(),
  externalId: integer().unique(),
  name: text().notNull(),
  description: text(),
  difficulty: integer(),
  equipment: text().$type<Equipment>(),
  images: text({mode: 'json'}).notNull().$type<string[]>(),
  params: text({mode: 'json'}).notNull().$type<number[]>(),
  userId: integer(),
  copiedFromId: integer(),
  parentExerciseId: integer(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
});

export const exerciseMuscle = sqliteTable('muscles', {
  id: integer().primaryKey().notNull(),
  exerciseId: integer().notNull(),
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
  exerciseId: integer().notNull().references(() => exercises.id),
  userId: integer().notNull(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
});

export const workoutExerciseSets = sqliteTable('workout_exercise_sets', {
  id: integer().primaryKey().notNull(),
  exerciseId: integer().notNull().references(() => exercises.id),
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
  exerciseId: integer().notNull().references(() => exercises.id, {onDelete: 'restrict'}),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
});

export const workoutTypeExerciseSets = sqliteTable('workout_type_exercise_sets', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  reps: integer(),
  exerciseId: integer().notNull().references(() => exercises.id, {onDelete: 'cascade'}),
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
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  type: text().notNull().$type<EntryType>(),
  title: text(),
  note: text(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  workoutId: integer().references(() => workouts.id, {onDelete: 'cascade'}),
  imageId: integer().references(() => images.id, {onDelete: 'cascade'}),
  weightId: integer().references(() => weight.id, {onDelete: 'cascade'}),
  visibility: text().notNull().$type<EntryVisibility>(),
  time: integer({mode: 'timestamp'}).notNull(),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  deletedAt: integer({mode: 'timestamp'}),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
});

export const images = sqliteTable('images', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  userId: integer().notNull().references(() => users.id, {onDelete: 'cascade'}),
  url: text(),
  image: text(),
  type: text().notNull().$type<ImageType>(),
  lastPulledAt: integer({mode: 'timestamp'}),
  lastPushedAt: integer({mode: 'timestamp'}),
});
