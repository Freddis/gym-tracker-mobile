import {CalorieGoal, Entry, EntryType, EntryUpsertDto, Meal, OutdoorRun, OutdoorWalk, PostEntryUpsertDto, Weight, Workout} from '../openapi-client';
import {AppCalorieGoal} from '../utils/CalorieGoalService/types/AppCalorieGoal';
import {DrizzleDb} from '../utils/drizzle';
import {AppMeal} from '../utils/MealService/types/AppMeal';
import {AppEntry, BaseEntry} from './models/AppEntry';
import {AppOutdoorRun} from './models/AppOutdoorRun';
import {AppOutdoorWalk} from './models/AppOutdoorWalk';
import {AppWeight} from './models/AppWeight';
import {CompleteAppWorkout} from './models/AppWorkout';

export type EntryObjectMap = Record<EntryType, unknown> & {
  [EntryType.WEIGHT]: Weight;
  [EntryType.WORKOUT]: Workout;
  [EntryType.POST]: null;
  [EntryType.OUTDOOR_RUN]: OutdoorRun;
  [EntryType.OUTDOOR_WALK]: OutdoorWalk;
  [EntryType.MEAL]: Meal;
  [EntryType.CALORIE_GOAL]: CalorieGoal;
}
export type EntryAppObjectMap = Record<EntryType, unknown> & {
  [EntryType.WEIGHT]: AppWeight;
  [EntryType.WORKOUT]: CompleteAppWorkout;
  [EntryType.POST]: null;
  [EntryType.OUTDOOR_RUN]: AppOutdoorRun;
  [EntryType.OUTDOOR_WALK]: AppOutdoorWalk;
  [EntryType.MEAL]: AppMeal;
  [EntryType.CALORIE_GOAL]: AppCalorieGoal;
}

export interface IEntryService<TType extends EntryType> {
  getObject(entry: Entry): EntryObjectMap[TType] | null
  getUpsertDto(entry: AppEntry & {type: TType}, dto: PostEntryUpsertDto): EntryUpsertDto
  wipeLocalData(db: DrizzleDb): Promise<boolean>
  deleteById(id: number, db: DrizzleDb): Promise<void>
  processPulledItems(db: DrizzleDb, items: [string, EntryObjectMap[TType]][]): Promise<Map<string, number>>
  loadMap(ids: number[]): Promise<Map<number, EntryAppObjectMap[TType]>>
  construct(row: BaseEntry, value: EntryAppObjectMap[TType]): AppEntry & {type: TType};
}
