import {CalorieGoal, ConsumedCalories, EntryType} from '../../openapi-client';
import {WeightAppEntry} from '../../types/models/AppEntry';
import {CalorieGoalService} from '../CalorieGoalService/CalorieGoalService';
import {DrizzleDb} from '../drizzle';
import {EntryService} from '../EntryService/EntryService';
import {FoodUtility} from '../FoodUtility/FoodUtility';
import {AppWeightGoal} from './types/AppWeightGoal';
import {WeightHistoryPeriod} from './types/WeightHistoryPeriod';


export class DashboardService {
  private readonly foodUtility = new FoodUtility();
  constructor(
    private readonly calorieGoalService: CalorieGoalService,
    private readonly entryService: EntryService,
    private readonly db: DrizzleDb
  ) {
  }

  async getCalorieGoal(): Promise<{consumedCalories: ConsumedCalories; goal: CalorieGoal;} | null> {
    const calorieGoal = await this.calorieGoalService.getCalorieGoal();
    if (!calorieGoal) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meals = await this.entryService.getEntries(this.db, {types: [EntryType.MEAL], date: today});
    const consumedCalories = this.foodUtility.getNutritionFacts(meals.flatMap((x) => x.meal.food));
    return {
      consumedCalories,
      goal: calorieGoal,
    };
  }

  async getWeightGoal(type: WeightHistoryPeriod = WeightHistoryPeriod.month): Promise<AppWeightGoal | null> {
    const daysMap: Record<WeightHistoryPeriod, number> = {
      [WeightHistoryPeriod.month]: 30,
      [WeightHistoryPeriod.halfYear]: 182,
      [WeightHistoryPeriod.year]: 365 * 3,
    };
    const daysAgo = daysMap[type];
    const day = 1000 * 60 * 60 * 24;
    const from = new Date(Date.now() - daysAgo * day);
    const weightHistory: WeightAppEntry[] = await this.entryService.getEntries(this.db, {types: [EntryType.WEIGHT], date: from, limit: 10000});
    return {
      history: weightHistory,
      size: daysAgo,
      type,
    };
  }
}
