import {getItemAsync} from "expo-secure-store";
import {DrizzleDb} from "../drizzle";
import {ExerciseService} from "../ExerciseService/ExerciseService";
import {Logger} from "../Logger/Logger";
import {WorkoutService} from "../WorkoutService/WorkoutService";
import {AuthUser, authUserValidator} from "@/components/AuthProvider/types/AuthUser";
import {client} from '@/openapi-client/client.gen';

export interface SyncState {
  currentStageName: string,
  itemsDone: number,
  itemsNumber: number
  done: boolean
}
export class SyncService {
  protected workoutService: WorkoutService;
  protected exerciseSercice: ExerciseService;
  protected logger: Logger;

  constructor(workouts: WorkoutService, exercises: ExerciseService){
    this.workoutService = workouts;
    this.exerciseSercice = exercises;
    this.logger = new Logger(this.constructor.name);
  }

  async syncWithServer(db: DrizzleDb, callback: (x: SyncState) => void = () => {}): Promise<boolean>{
    try {
      const result = await this.sync(db,callback)
      return result;
    } catch(e: unknown){
      this.logger.error('Error during syncing',e);
      callback({
        currentStageName: 'ERROR',
        itemsNumber: 2,
        itemsDone: 0,
        done: true,
      })
      return false;
    }
  }

  async getUser(): Promise<AuthUser | null> {
    const user = await getItemAsync('user')
    if (user === null) {
      return null;
    }
    let parsedUser: unknown = {};
    try {
      parsedUser = JSON.parse(user);
    } catch {
      /* empty */
    }
    const result = authUserValidator.safeParse(parsedUser);
    if(!result.success){
      return null
    }
    return result.data
      
  }
  protected async sync(db: DrizzleDb,callback: (x: SyncState) => void): Promise<boolean> {
    const state: SyncState = {
      currentStageName: "Workouts",
      itemsDone: 0,
      itemsNumber: 2,
      done: false,
    }
    callback(state)
    // todo: fix this part across this service and AuthProvider
    const user = await this.getUser();
    if(!user){
      callback({
        ...state,
        done: true,
      })
      return false;
    }
    const config =  {
      responseType: 'json',
      baseURL: 'http://192.168.0.96:3000/api/v1',
      headers: {
        Authorization: 'Bearer ' + user.jwt,
      },
    } as const;
   client.setConfig(config);
    const workoutsSynced = await this.workoutService.syncWithServer(db)
    if(!workoutsSynced){
      this.logger.info("Couldn't sync workouts");
      callback({
        ...state,
        done: true,
      })
      return false;
    }
    state.itemsDone += 1
    state.currentStageName = 'Exercises';
    callback(state);
    const exercisesSynced = await this.exerciseSercice.syncWithServer(db);
    if(!exercisesSynced){
      this.logger.info("Couldn't sync exercises");
      callback({
        ...state,
        done: true,
      })
      return false;
    }
    state.itemsDone += 1
    this.logger.debug("Syncing successfully completed")
    state.done = true;
    callback(state)
    return true;
  }
}