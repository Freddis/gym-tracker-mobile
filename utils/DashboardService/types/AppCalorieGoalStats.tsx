import {CalorieGoal, ConsumedCalories} from '../../../openapi-client';
import {MealAppEntry} from '../../../types/models/AppEntry';

export interface AppCalorieGoalStats {
  consumedCalories: ConsumedCalories;
  goal: CalorieGoal;
  history: MealAppEntry[];
}
