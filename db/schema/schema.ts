import { integer,  sqliteTable,  text} from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: integer().primaryKey({autoIncrement: true}).notNull(),
  name: text(),
  description: text(),
  createdAt: integer().notNull(),
  updatedAt: integer(),
});
