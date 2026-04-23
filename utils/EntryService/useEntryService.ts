/* eslint-disable react-hooks/rules-of-hooks */
import {ApiService} from '../ApiService/ApiService';
import {useDrizzle} from '../drizzle';
import {useImageService} from '../ImageService/useImageService';
import {useWeightService} from '../WeightService/useWeightService';
import {useWorkoutService} from '../WorkoutService/useWorkoutService';
import {EntryService} from './EntryService';

const [weight] = useWeightService();
const [workout] = useWorkoutService();
const [image] = useImageService();
const [db] = useDrizzle();
const service = new EntryService(new ApiService(), weight, workout, image, db);

export const useEntryService = (): [EntryService] => {

  return [service];
};
