import {schema} from "@/db/schema";
import {drizzle, ExpoSQLiteDatabase} from "drizzle-orm/expo-sqlite";
import {openDatabaseSync} from "expo-sqlite";

const expo = openDatabaseSync('db.db');
const db = drizzle(expo,{
  schema,
});
export type DrizzleDb = ExpoSQLiteDatabase<typeof schema> 
export type DrizzleSchema = typeof schema
export const useDrizzle = (): [DrizzleDb,DrizzleSchema] => {
  return [db,schema] as const
}