import {AsyncDrizzleDb} from '../../drizzle';
import {StageProgressCallback} from './StageProgressCallback';

export interface ISyncedEntityService {
  pullFromServer(_userId: number, trx: AsyncDrizzleDb, progress: StageProgressCallback): Promise<boolean>
  pushToServer(userId: number, trx: AsyncDrizzleDb, progress: StageProgressCallback): Promise<boolean>
  wipeLocalData(userId: number, trx: AsyncDrizzleDb): Promise<boolean>;
}
