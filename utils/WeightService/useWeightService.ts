import {ApiService} from '../ApiService/ApiService';
import {db} from '../drizzle';
import {WeightService} from './WeightService';

const service = new WeightService(new ApiService(), db);
export const useWeightService = (): [WeightService] => {
  return [service];
};
