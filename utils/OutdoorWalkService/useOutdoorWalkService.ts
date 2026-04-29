import {db} from '../drizzle';
import {ApiService} from '../ApiService/ApiService';
import {OutdoorWalkService} from './OutdoorWalkService';

const service = new OutdoorWalkService(new ApiService(), db);

export const useOutdoorWalkService = (): [OutdoorWalkService] => {
  return [service];
};
