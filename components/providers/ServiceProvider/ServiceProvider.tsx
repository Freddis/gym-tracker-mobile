import {createContext, FC, ReactNode, useContext} from 'react';
import {EntryService} from '../../../utils/EntryService/EntryService';
import {EntryAtomService} from '../../../utils/EntryAtomService/EntryAtomService';
import {ExerciseService} from '../../../utils/ExerciseService/ExerciseService';
import {FoodService} from '../../../utils/FoodService/FoodService';
import {ImageService} from '../../../utils/ImageService/ImageService';
import {WeightService} from '../../../utils/WeightService/WeightService';
import {ApiService} from '../../../utils/ApiService/ApiService';
import {db} from '../../../utils/drizzle';
import {OutdoorWalkService} from '../../../utils/OutdoorWalkService/OutdoorWalkService';
import {OutdoorRunService} from '../../../utils/OutdoorRunService/OutdoorRunService';
import {WorkoutService} from '../../../utils/WorkoutService/WorkoutService';
import {EntryListService} from '../../../utils/EntryListService/EntryListService';
import {getDefaultStore} from 'jotai';

const apiService = new ApiService();
const weightService = new WeightService(apiService, db);
const workoutService = new WorkoutService(db);
const imageService = new ImageService(apiService, db);
const outdoorRunService = new OutdoorRunService(apiService, db);
const outdoorWalkService = new OutdoorWalkService(apiService, db);
const entryService = new EntryService(
  apiService,
  weightService,
  workoutService,
  imageService,
  outdoorRunService,
  outdoorWalkService,
  db,
);
const entryListService = new EntryListService(getDefaultStore());
const entryAtomService = new EntryAtomService(entryService, entryListService);
const exerciseService = new ExerciseService();
const foodService = new FoodService(apiService, db, imageService);

export const services = {
  entryAtomService: entryAtomService,
  exerciseService: exerciseService,
  foodService: foodService,
  imageService: imageService,
  entryListService: entryListService,
  entryService: entryService,
};
export const ServiceContext = createContext(services);

export const useServices = () => {
  return useContext(ServiceContext);
};

export const ServiceProvider: FC<{children: ReactNode | ReactNode[]}> = (props) => {
  return (
    <ServiceContext.Provider value={services}>
      {props.children}
    </ServiceContext.Provider>
  );
};
