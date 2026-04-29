import {schema} from '../../db/schema';
import {AppHeartRateDataPoint} from './AppHeartRateDataPoint';
import {AppPathDataPoint} from './AppPathDataPoint';

export type OutdoorWalkRow = typeof schema.outdoorWalks.$inferSelect;

export interface AppOutdoorWalk extends OutdoorWalkRow {
  geoData: AppPathDataPoint[] | null;
  heartRateData: AppHeartRateDataPoint[] | null;
}
