import {Meal} from '../../../openapi-client';
import {AppFoodComponent} from '../../FoodService/types/AppFoodComponent';

export interface AppMeal extends Omit<Meal, 'food'> {
  id: number;
  food: AppFoodComponent[];
}
