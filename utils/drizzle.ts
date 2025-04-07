import {schema} from "@/db/schema";
import {drizzle, ExpoSQLiteDatabase} from "drizzle-orm/expo-sqlite";
import {openDatabaseSync} from "expo-sqlite";

const expo = openDatabaseSync('db.db');
const db = drizzle(expo,{
  schema,
});

export const useDrizzle = (): [ExpoSQLiteDatabase<typeof schema>,typeof schema] => {
  return [db,schema] as const
}