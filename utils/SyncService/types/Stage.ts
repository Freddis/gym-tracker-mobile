import {AsyncDrizzleDb} from '@/utils/drizzle';

export interface Stage {
  name: string,
  errorMsg: string,
  action: (db: AsyncDrizzleDb, userId: number) => Promise<boolean>
}
