import {schema} from '../../db/schema';
import {EntryType} from '../../openapi-client';
import {AppImage} from './AppImage';
import {AppWeight} from './AppWeight';
import {CompleteAppWorkout} from './AppWorkout';

type EntryRow = typeof schema.entries.$inferSelect
// export interface AppEntry extends EntryRow {
//   workout?: CompleteAppWorkout;
//   weight?: AppWeight;
// }
export interface BaseEntry extends EntryRow {
  image: AppImage | null;
}
export interface WorkoutAppEntry extends BaseEntry {
  type: typeof EntryType.WORKOUT;
  workout: CompleteAppWorkout;
}

export interface WeightAppEntry extends BaseEntry {
  type: typeof EntryType.WEIGHT;
  weight: AppWeight;
}

export interface PostAppEntry extends BaseEntry {
  type: typeof EntryType.POST;

}

export type AppEntry = WorkoutAppEntry | WeightAppEntry | PostAppEntry;
