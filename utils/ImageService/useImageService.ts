import {ImageService} from './ImageService';
import {db} from '../drizzle';
import {ApiService} from '../ApiService/ApiService';

const service = new ImageService(new ApiService(), db);

export const useImageService = (): [ImageService] => {
  return [service];
};
