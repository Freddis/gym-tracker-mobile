import {FoodComponent} from '../../../openapi-client';
import {AppFood} from './AppFood';

export interface AppFoodComponent extends Omit<FoodComponent, 'food'> {
  food: AppFood;
}
