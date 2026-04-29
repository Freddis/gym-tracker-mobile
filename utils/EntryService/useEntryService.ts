/* eslint-disable react-hooks/rules-of-hooks */
import {ApiService} from '../ApiService/ApiService';
import {useDrizzle} from '../drizzle';
import {useImageService} from '../ImageService/useImageService';
import {useOutdoorRunService} from '../OutdoorRunService/useOutdoorRunService';
import {useOutdoorWalkService} from '../OutdoorWalkService/useOutdoorWalkService';
import {useWeightService} from '../WeightService/useWeightService';
import {useWorkoutService} from '../WorkoutService/useWorkoutService';
import {EntryService} from './EntryService';

const [weight] = useWeightService();
const [workout] = useWorkoutService();
const [image] = useImageService();
const [outdoorRun] = useOutdoorRunService();
const [outdoorWalk] = useOutdoorWalkService();
const [db] = useDrizzle();
const service = new EntryService(new ApiService(), weight, workout, image, outdoorRun, outdoorWalk, db);

export const useEntryService = (): [EntryService] => {

  return [service];
};
