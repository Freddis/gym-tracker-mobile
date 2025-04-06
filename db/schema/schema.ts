import { integer,  sqliteTable,  text} from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  name: text(),
  description: text(),
  createdAt: integer().notNull(),
  updatedAt: integer(),
});


export const users = sqliteTable('users', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  name: text().notNull(),
  email: text().notNull(),
  jwt: text().notNull().notNull(),
  updatedAt: integer({ mode: 'timestamp'}),
});