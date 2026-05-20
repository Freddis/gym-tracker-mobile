import {AsyncDrizzleDb} from '@/utils/drizzle';
import {StageProgressCallback} from './StageProgressCallback';

export interface Stage {
  name: string,
  errorMsg: string,
  action: (userId: number, trx: AsyncDrizzleDb, progress: StageProgressCallback) => Promise<boolean>
}
