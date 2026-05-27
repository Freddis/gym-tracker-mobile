import {AppFood} from '../../../../../utils/FoodService/types/AppFood';

export interface FoodUpdateFormProps {
  food: AppFood;
  onChange: (food: AppFood, image?: string | null) => void;
  onDelete?: () => void;
}
