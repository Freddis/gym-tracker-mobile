import {Food} from '../../../openapi-client';
import {AppImage} from '../../../types/models/AppImage';
import {AppFoodComponent} from './AppFoodComponent';

export interface AppFood extends Omit<Food, 'image' | 'components'> {
  image: AppImage | null;
  components: AppFoodComponent[];
  lastPushedAt: Date | null;
  lastPulledAt: Date | null;
}
