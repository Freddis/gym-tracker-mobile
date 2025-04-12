import {DrizzleDb} from "../drizzle";
import {ExerciseService} from "../ExerciseService/ExerciseService";
import {Logger} from "../Logger/Logger";
import {WorkoutService} from "../WorkoutService/WorkoutService";

export interface SyncStage {
  name: string,
  action: (db: DrizzleDb) => Promise<boolean>  
}
export interface SyncState {
  currentStageName: string,
  itemsDone: number,
  itemsNumber: number
  done: boolean
}
export class SyncService {
  protected workoutService: WorkoutService;
  protected exerciseService: ExerciseService;
  protected logger: Logger;

  constructor(workouts: WorkoutService, exercises: ExerciseService){
    this.workoutService = workouts;
    this.exerciseService = exercises;
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

  protected async sync(db: DrizzleDb,callback: (x: SyncState) => void): Promise<boolean> {

    const stages = this.getStages()
    const itemsNumber = stages.length;
    let itemsDone = 0;
    for(const stage of stages){
      const state: SyncState = {
        currentStageName: stage.name,
        itemsDone: itemsDone++,
        itemsNumber,
        done: false,
      }
      callback(state)
      const success = await stage.action(db)
      if(!success){
        this.logger.info(`Couldn't sync ${stage.name}`);
        callback({
          ...state,
          done: true,
        })
        return false;
      }
    }
    this.logger.debug("Syncing successfully completed")
    callback({
      currentStageName: 'Finished',
      itemsDone: itemsNumber,
      itemsNumber,
      done: true
    })
    return true;
  }

  protected getStages(): SyncStage[] {
    const result: SyncStage[] = [
      {
        name: 'Exercises',
        action: this.exerciseService.syncWithServer.bind(this.exerciseService),
      },
      {
        name: 'Workouts',
        action: this.workoutService.syncWithServer.bind(this.workoutService),
      }
    ];
    return result;
  }
}