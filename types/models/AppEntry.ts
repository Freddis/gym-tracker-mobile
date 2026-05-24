import {schema} from '../../db/schema';
import {EntryType} from '../../openapi-client';
import {AppCalorieGoal} from '../../utils/CalorieGoalService/types/AppCalorieGoal';
import {AppMeal} from '../../utils/MealService/types/AppMeal';
import {AppImage} from './AppImage';
import {AppOutdoorRun} from './AppOutdoorRun';
import {AppOutdoorWalk} from './AppOutdoorWalk';
import {AppWeight} from './AppWeight';
import {CompleteAppWorkout} from './AppWorkout';

type EntryRow = typeof schema.entries.$inferSelect
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

export interface OutdoorRunAppEntry extends BaseEntry {
  type: typeof EntryType.OUTDOOR_RUN;
  outdoorRun: AppOutdoorRun;
}

export interface OutdoorWalkAppEntry extends BaseEntry {
  type: typeof EntryType.OUTDOOR_WALK;
  outdoorWalk: AppOutdoorWalk;
}

export interface MealAppEntry extends BaseEntry {
  type: typeof EntryType.MEAL;
  meal: AppMeal;
}

export interface CalorieGoalAppEntry extends BaseEntry {
  type: typeof EntryType.CALORIE_GOAL;
  calorieGoal: AppCalorieGoal;
}
export type AppEntry = WorkoutAppEntry | WeightAppEntry | PostAppEntry | OutdoorRunAppEntry
| OutdoorWalkAppEntry | MealAppEntry | CalorieGoalAppEntry;
