import {schema} from '../../db/schema';
import {AppHeartRateDataPoint} from './AppHeartRateDataPoint';
import {AppPathDataPoint} from './AppPathDataPoint';

export type OutdoorRunRow = typeof schema.outdoorRuns.$inferSelect;

export interface AppOutdoorRun extends OutdoorRunRow {
  geoData: AppPathDataPoint[] | null;
  heartRateData: AppHeartRateDataPoint[] | null;
}
