import {db} from '../drizzle';
import {ApiService} from '../ApiService/ApiService';
import {OutdoorRunService} from './OutdoorRunService';

const service = new OutdoorRunService(new ApiService(), db);

export const useOutdoorRunService = (): [OutdoorRunService] => {
  return [service];
};
