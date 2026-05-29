import {WeightAppEntry} from '../../../types/models/AppEntry';
import {WeightHistoryPeriod} from './WeightHistoryPeriod';

export interface AppWeightGoal {
  history: WeightAppEntry[];
  size: number;
  type: WeightHistoryPeriod;
}
