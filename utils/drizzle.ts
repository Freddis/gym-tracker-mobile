import {relations, schema} from '@/db/schema';
import {drizzle, ExpoSQLiteDatabase} from 'drizzle-orm/expo-sqlite';
import {openDatabaseSync} from 'expo-sqlite';
import {QueryLogger} from './QueryLogger/QueryLogger';
import {SQLiteTable, SQLiteUpdateSetSource} from 'drizzle-orm/sqlite-core';
import {getTableColumns, sql, SQL} from 'drizzle-orm';

const expo = openDatabaseSync('db.db', {});
const db = drizzle(expo, {
  schema: {...schema, ...relations},
  logger: new QueryLogger(false, true, 'mysql'),
});
db.run('PRAGMA foreign_keys = ON;');
console.log(expo.databasePath);
export type DrizzleSchema = typeof schema
export type DrizzleRelations = typeof relations
export type DrizzleFullSchema = DrizzleSchema & DrizzleRelations
export type DrizzleDb = ExpoSQLiteDatabase<DrizzleFullSchema>
export const useDrizzle = (): [DrizzleDb, DrizzleSchema] => {
  return [db, schema] as const;
};

export const conflictUpdateSetAllColumns = <TTable extends SQLiteTable>(
  table: TTable,
): SQLiteUpdateSetSource<TTable> => {
  const columns = getTableColumns(table);
  const record: Record<string, SQL> = {};
  for (const [columnName, columnInfo] of Object.entries(columns)) {
    if (columnName !== 'id') {
      record[columnName] = sql.raw(`excluded.${columnInfo.name}`);
    }
  }
  return record as SQLiteUpdateSetSource<TTable>;
};
