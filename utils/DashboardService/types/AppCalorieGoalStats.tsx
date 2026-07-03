import {CalorieGoal, ConsumedCalories} from '../../../openapi-client';

export interface AppCalorieGoalStats {
  consumedCalories: ConsumedCalories;
  averageCalories: number;
  goal: CalorieGoal;
  history: {date: Date, value: ConsumedCalories}[];
  size: number;
}
