import {CalorieGoal, ConsumedCalories} from '../../../openapi-client';

export interface AppCalorieGoalStats {
  consumedCalories: ConsumedCalories;
  goal: CalorieGoal;
  history: {date: Date, value: ConsumedCalories}[];
  size: number;
}
