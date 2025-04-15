import {DrizzleDb} from "../drizzle";
import {ExerciseService} from "../ExerciseService/ExerciseService";
import {Logger} from "../Logger/Logger";
import {WorkoutService} from "../WorkoutService/WorkoutService";
import {Progress} from "./types/Progress";
import {Stage} from "./types/Stage";
export class SyncService {
  protected workoutService: WorkoutService;
  protected exerciseService: ExerciseService;
  protected logger: Logger;

  constructor(workouts: WorkoutService, exercises: ExerciseService){
    this.workoutService = workouts;
    this.exerciseService = exercises;
    this.logger = new Logger(this.constructor.name);
  }

  async wipeThenSync(db: DrizzleDb, callback: (x: Progress) => void = () => {}): Promise<Progress> {
    const combined = [...this.getWipeStages(),...this.getSyncStages()]
    return this.runActions(db,combined,callback,'Successfully synced with server')
  }

  async syncWithServer(db: DrizzleDb, callback: (x: Progress) => void = () => {}): Promise<Progress>{
    return this.runActions(db,this.getSyncStages(),callback,'Successfully synced with server')
  }

  async wipeLocalData(db: DrizzleDb,callback: (x: Progress) => void): Promise<Progress> {
    return this.runActions(db,this.getWipeStages(),callback,'Successfully wiped data')
  }

  protected async runActions(db: DrizzleDb, stages: Stage[], callback: (x: Progress) => void, finalMessage = 'Done'): Promise<Progress> {
    const itemsNumber = stages.length;
    let itemsDone = 0;
    for(const stage of stages){
      const state: Progress = {
        currentStageName: stage.name,
        itemsDone: itemsDone++,
        itemsNumber,
        message: 'In Progress',
        error: false,
        done: false,
      }
      try {
        callback(state)
        const success = await stage.action(db)
        if(!success){
          const newState: Progress = {
            ...state,
            message: stage.errorMsg,
            error: true,
            done: true,
          }
          this.logger.info(newState.message);
          callback(newState)
          return newState;
        }
      } catch(e: unknown){
        const errState: Progress = {
          ...state,
          message: 'Unknown Error',
          error: true,
          done: true,
        }
        this.logger.error('Error during syncing',{e,state: errState});
        callback(errState)
        return errState;
      }
    }    
    const final: Progress = {
      currentStageName: stages[stages.length-1]?.name ?? 'Done',
      itemsDone: itemsNumber,
      itemsNumber,
      error: false,
      message: finalMessage,
      done: true
    }
    callback(final)
    return final;
  }

  protected getSyncStages(): Stage[] {
    const stages: Stage[] = [
      {
        name: 'Exercises',
        errorMsg: "Couldn't sync exercises",
        action: this.exerciseService.syncWithServer.bind(this.exerciseService),
      },
      {
        name: 'Workouts',
        action: this.workoutService.syncWithServer.bind(this.workoutService),
        errorMsg: "Couldn't sync workouts",
      }
    ];
    return stages
  }

  protected getWipeStages(): Stage[] {
    const stages: Stage[] = [
      {
        name: 'Workouts',
        action: this.workoutService.wipeLocalData.bind(this.workoutService),
        errorMsg: "Couldn't delete workouts",
      },
      {
        name: 'Exercises',
        errorMsg: "Couldn't delete exercises",
        action: this.exerciseService.wipeLocalData.bind(this.exerciseService),
      },
    ];
    return stages
  }
}