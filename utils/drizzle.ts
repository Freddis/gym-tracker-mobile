import {relations, schema} from "@/db/schema";
import {drizzle, ExpoSQLiteDatabase} from "drizzle-orm/expo-sqlite";
import {openDatabaseSync} from "expo-sqlite";
import {QueryLogger} from "./QueryLogger/QueryLogger";

const expo = openDatabaseSync('db.db');
const db = drizzle(expo,{
  schema: {...schema, ...relations},
  logger: new QueryLogger(false,true,'mysql'),
});
console.log(expo.databasePath)
export type DrizzleSchema = typeof schema 
export type DrizzleRelations = typeof relations
export type DrizzleFullSchema = DrizzleSchema & DrizzleRelations
export type DrizzleDb = ExpoSQLiteDatabase<DrizzleFullSchema> 
export const useDrizzle = (): [DrizzleDb,DrizzleSchema] => {
  return [db,schema] as const
}