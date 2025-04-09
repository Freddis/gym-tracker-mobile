import { integer,  sqliteTable,  text} from 'drizzle-orm/sqlite-core';

// export const exercises = sqliteTable('exercises', {
//   id: integer().primaryKey({autoIncrement: true}).notNull(),
//   name: text(),
//   description: text(),
//   createdAt: integer().notNull(),
//   updatedAt: integer(),
// });

export const exercises = sqliteTable('exercises', {
  id: integer().primaryKey().notNull(),
  externalId: integer(),
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
// export const workouts = sqliteTable('workouts', {
//   id: integer().primaryKey({autoIncrement: true}).notNull(),
//   externalId: integer(),
//   typeId: integer(),
//   userId: integer(),
//   calories: real().notNull(),
//   start: integer({mode: 'timestamp'}).notNull(),
//   end: integer({mode: 'timestamp'}).notNull(),
//   createdAt: integer({mode: 'timestamp'}).notNull(),
//   updatedAt: integer({mode: 'timestamp'}),
// });

// export const workoutExercises = sqliteTable('workout_exercises', {
//   id: integer().primaryKey().notNull(),
//   externalId: integer(),
//   workoutId: integer().notNull(),
//   exerciseId: integer().notNull(),
//   createdAt: integer({ mode: 'timestamp'}).notNull(),
//   updatedAt: integer({ mode: 'timestamp'}),
// });

// export const workoutExerciseSets = sqliteTable('workout_exercise_sets', {
//   id: integer().primaryKey().notNull(),
//   externalId: integer(),
//   exerciseId: integer().notNull(),
//   workoutId: integer().notNull(),
//   start: integer({ mode: 'timestamp'}).notNull(),
//   end: integer({ mode: 'timestamp'}).notNull(),
//   weight: real(),
//   reps: integer(),
//   createdAt: integer({ mode: 'timestamp'}).notNull(),
//   updatedAt: integer({ mode: 'timestamp'}),
// });

export const users = sqliteTable('users', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  name: text().notNull(),
  email: text().notNull(),
  jwt: text().notNull().notNull(),
  updatedAt: integer({ mode: 'timestamp'}),
});