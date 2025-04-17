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

  async wipeThenSync(db: DrizzleDb, userId: number,callback: (x: Progress) => void = () => {}): Promise<Progress> {
    const combined = [...this.getWipeStages(),...this.getSyncStages()]
    return this.runActions(db,userId,combined,callback,'Successfully synced with server')
  }

  async syncWithServer(db: DrizzleDb,userId: number, callback: (x: Progress) => void = () => {}): Promise<Progress>{
    return this.runActions(db,userId,this.getSyncStages(),callback,'Successfully synced with server')
  }

  async wipeLocalData(db: DrizzleDb,userId: number,callback: (x: Progress) => void): Promise<Progress> {
    return this.runActions(db,userId,this.getWipeStages(),callback,'Successfully wiped data')
  }

  protected async runActions(db: DrizzleDb, userId: number,stages: Stage[], callback: (x: Progress) => void, finalMessage = 'Done'): Promise<Progress> {
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
        const success = await stage.action(db,userId)
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
        name: 'Pulling Exercises',
        errorMsg: "Couldn't pull exercises",
        action: this.exerciseService.pullFromServer.bind(this.exerciseService),
      },
      {
        name: 'Pulling Workouts',
        action: this.workoutService.pullFromServer.bind(this.workoutService),
        errorMsg: "Couldn't pull workouts",
      },
      {
        name: 'Pushing Exercises',
        action: this.exerciseService.pushToServer.bind(this.exerciseService),
        errorMsg: "Couldn't push exercises",
      },
      {
        name: 'Pushing Workouts',
        action: this.workoutService.pushToServer.bind(this.workoutService),
        errorMsg: "Couldn't push workouts",
      }
    ];
    return stages
  }

  protected getWipeStages(): Stage[] {
    const stages: Stage[] = [
      {
        name: 'Wiping Workouts',
        action: this.workoutService.wipeLocalData.bind(this.workoutService),
        errorMsg: "Couldn't delete workouts",
      },
      {
        name: 'Wiping Exercises',
        errorMsg: "Couldn't delete exercises",
        action: this.exerciseService.wipeLocalData.bind(this.exerciseService),
      },
    ];
    return stages
  }
}