import {AsyncDrizzleDb} from '@/utils/drizzle';
import {StageProgressCallback} from './StageProgressCallback';

export interface Stage {
  name: string,
  errorMsg: string,
  action: (db: AsyncDrizzleDb, userId: number, progress: StageProgressCallback) => Promise<boolean>
}
