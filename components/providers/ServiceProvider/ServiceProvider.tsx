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
import {WorkoutTypeService} from '../../../utils/WorkoutTypeService/WorkoutTypeService';
import {SyncService} from '../../../utils/SyncService/SyncService';
import {CalorieGoalService} from '../../../utils/CalorieGoalService/CalorieGoalService';
import {MealService} from '../../../utils/MealService/MealService';
import {DashboardService} from '../../../utils/DashboardService/DashboardService';
import {HealthKitService} from '../../../utils/HealthKitService/HealthKitService';
import {EntryRepositoryService} from '../../../utils/EntryRepositoryService/EntryRepositoryService';

const apiService = new ApiService();
const imageService = new ImageService(apiService, db);
const entryRepositoryService = new EntryRepositoryService(imageService);
const weightService = new WeightService(db, entryRepositoryService);
const exerciseService = new ExerciseService(db);
const workoutService = new WorkoutService(db, entryRepositoryService, exerciseService);
const outdoorRunService = new OutdoorRunService(apiService, db);
const outdoorWalkService = new OutdoorWalkService(db, weightService, entryRepositoryService);
const foodService = new FoodService(apiService, db, imageService);
const mealService = new MealService(db, foodService, entryRepositoryService);
const calorieGoalService = new CalorieGoalService(db);
const entryService = new EntryService(
  apiService,
  weightService,
  workoutService,
  imageService,
  outdoorRunService,
  outdoorWalkService,
  mealService,
  calorieGoalService,
  db,
);
const healthKitService = new HealthKitService(entryService);
const store = getDefaultStore();
const entryListService = new EntryListService(store);
const entryAtomService = new EntryAtomService(entryService, entryListService, store);
const workoutTypeService = new WorkoutTypeService(exerciseService);
const syncService = new SyncService(workoutService, exerciseService, workoutTypeService, weightService, entryService, foodService);
const dashboardService = new DashboardService(calorieGoalService, entryService, db);
export const services = {
  entryAtomService: entryAtomService,
  exerciseService: exerciseService,
  foodService: foodService,
  imageService: imageService,
  entryListService: entryListService,
  entryService: entryService,
  syncService: syncService,
  workoutTypeService: workoutTypeService,
  workoutService: workoutService,
  calorieGoalService: calorieGoalService,
  dashboardService: dashboardService,
  outdoorRunService: outdoorRunService,
  outdoorWalkService: outdoorWalkService,
  mealService: mealService,
  healthKitService: healthKitService,
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
