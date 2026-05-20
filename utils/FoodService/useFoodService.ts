/* eslint-disable react-hooks/rules-of-hooks */
import {ApiService} from '../ApiService/ApiService';
import {FoodService} from './FoodService';
import {db} from '../drizzle';
import {useImageService} from '../ImageService/useImageService';

const [image] = useImageService();
const service = new FoodService(new ApiService(), db, image);

export const useFoodService = (): [FoodService] => {
  return [service];
};
