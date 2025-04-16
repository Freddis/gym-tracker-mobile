import { integer,  real,  sqliteTable,  text} from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: integer().primaryKey().notNull(),
  externalId: integer().unique(),
  name: text().notNull(),
  description: text(),
  difficulty: integer(),
  equipmentId: integer().notNull(),
  images: text({mode: 'json'}).notNull().$type<string[]>(),
  params: text({mode: 'json'}).notNull().$type<number[]>(),
  userId: integer(),
  copiedFromId: integer(),
  parentExerciseId: integer(),
  createdAt: integer({ mode: 'timestamp'}).notNull(),
  updatedAt: integer({ mode: 'timestamp'}),
});
export const workouts = sqliteTable('workouts', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  externalId: integer().unique(),
  typeId: integer(),
  userId: integer().notNull(),
  calories: real().notNull(),
  start: integer({mode: 'timestamp'}).notNull(),
  end: integer({mode: 'timestamp'}),
  createdAt: integer({mode: 'timestamp'}).notNull(),
  updatedAt: integer({mode: 'timestamp'}),
  syncedAt: integer({mode: 'timestamp'}),
});

export const workoutExercises = sqliteTable('workout_exercises', {
  id: integer().primaryKey().notNull(),
  externalId: integer().unique(),
  workoutId: integer().notNull().references(() => workouts.id),
  exerciseId: integer().notNull().references(() => exercises.id),
  userId: integer().notNull(),
  createdAt: integer({ mode: 'timestamp'}).notNull(),
  updatedAt: integer({ mode: 'timestamp'}),
});

export const workoutExerciseSets = sqliteTable('workout_exercise_sets', {
  id: integer().primaryKey().notNull(),
  externalId: integer().unique(),
  exerciseId: integer().notNull().references(() => exercises.id),
  workoutExerciseId: integer().notNull().references(() => workoutExercises.id),
  userId: integer().notNull(),
  workoutId: integer().notNull().references(() => workouts.id),
  start: integer({ mode: 'timestamp'}),
  end: integer({ mode: 'timestamp'}),
  finished: integer({mode:'boolean'}).notNull(),
  weight: real(),
  reps: integer(),
  createdAt: integer({ mode: 'timestamp'}).notNull(),
  updatedAt: integer({ mode: 'timestamp'}),
});

export const users = sqliteTable('users', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  name: text().notNull(),
  email: text().notNull(),
  jwt: text().notNull().notNull(),
  updatedAt: integer({ mode: 'timestamp'}),
});

