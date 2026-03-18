import {schema} from '../../db/schema';
import {EntryType} from '../../openapi-client';
import {AppWeight} from './AppWeight';
import {CompleteAppWorkout} from './AppWorkout';

type EntryRow = typeof schema.entries.$inferSelect
// export interface AppEntry extends EntryRow {
//   workout?: CompleteAppWorkout;
//   weight?: AppWeight;
// }
export interface WorkoutAppEntry extends EntryRow {
  type: typeof EntryType.WORKOUT;
  workout: CompleteAppWorkout;
}

export interface WeightAppEntry extends EntryRow {
  type: typeof EntryType.WEIGHT;
  weight: AppWeight;
}

export type AppEntry = WorkoutAppEntry | WeightAppEntry;
