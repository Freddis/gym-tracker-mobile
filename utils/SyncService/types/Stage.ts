import {DrizzleDb} from "@/utils/drizzle";

export interface Stage {
  name: string,
  errorMsg: string,
  action: (db: DrizzleDb) => Promise<boolean>  
}