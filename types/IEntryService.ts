import {CalorieGoal, Entry, EntryType, EntryUpsertDto, Meal, OutdoorRun, OutdoorWalk, PostEntryUpsertDto, Weight, Workout} from '../openapi-client';
import {DrizzleDb} from '../utils/drizzle';
import {AppEntry} from './models/AppEntry';

export type EntryObjectMap = Record<EntryType, unknown> & {
  [EntryType.WEIGHT]: Weight;
  [EntryType.WORKOUT]: Workout;
  [EntryType.POST]: null;
  [EntryType.OUTDOOR_RUN]: OutdoorRun;
  [EntryType.OUTDOOR_WALK]: OutdoorWalk;
  [EntryType.MEAL]: Meal;
  [EntryType.CALORIE_GOAL]: CalorieGoal;
}

export interface IEntryService<TType extends EntryType> {
  getObject(entry: Entry): EntryObjectMap[TType] | null
  getUpsertDto(entry: AppEntry & {type: TType}, dto: PostEntryUpsertDto): EntryUpsertDto
  wipeLocalData(db: DrizzleDb): Promise<boolean>
  deleteById(id: number, db: DrizzleDb): Promise<void>
  processedPulledItems(db: DrizzleDb, items: [string, EntryObjectMap[TType]][]): Promise<Map<string, number>>
}
