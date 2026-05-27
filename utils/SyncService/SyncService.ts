import {asyncDrizzle, DrizzleDb} from '../drizzle';
import {EntryService} from '../EntryService/EntryService';
import {ExerciseService} from '../ExerciseService/ExerciseService';
import {FoodService} from '../FoodService/FoodService';
import {Logger} from '../Logger/Logger';
import {transactionAsync} from '../runTransaction';
import {WeightService} from '../WeightService/WeightService';
import {WorkoutService} from '../WorkoutService/WorkoutService';
import {WorkoutTypeService} from '../WorkoutTypeService/WorkoutTypeService';
import {Progress} from './types/Progress';
import {Stage} from './types/Stage';
export class SyncService {
  protected workoutService: WorkoutService;
  protected exerciseService: ExerciseService;
  protected logger: Logger;
  protected workoutTypeService: WorkoutTypeService;
  protected weightService: WeightService;
  protected entryService: EntryService;
  protected foodService: FoodService;
  constructor(
    workouts: WorkoutService,
    exercises: ExerciseService,
    workoutTypes: WorkoutTypeService,
    weightService: WeightService,
    entryService: EntryService,
    foodService: FoodService,
  ) {
    this.workoutService = workouts;
    this.exerciseService = exercises;
    this.workoutTypeService = workoutTypes;
    this.weightService = weightService;
    this.entryService = entryService;
    this.foodService = foodService;
    this.logger = new Logger(this.constructor.name);
  }

  async wipeThenSync(db: DrizzleDb, userId: number, callback: (x: Progress) => void = () => {}): Promise<Progress> {
    const combined = [...this.getWipeStages(), ...this.getSyncStages()];
    return this.runActions(db, userId, combined, callback, 'Successfully synced with server');
  }

  async syncWithServer(db: DrizzleDb, userId: number, callback: (x: Progress) => void = () => {}): Promise<Progress> {
    return this.runActions(db, userId, this.getSyncStages(), callback, 'Successfully synced with server');
  }

  async wipeLocalData(db: DrizzleDb, userId: number, callback: (x: Progress) => void): Promise<Progress> {
    return this.runActions(db, userId, this.getWipeStages(), callback, 'Successfully wiped data');
  }

  protected async runActions(
    db: DrizzleDb,
    userId: number,
    stages: Stage[],
    callback: (x: Progress) => void,
    finalMessage = 'Done'
  ): Promise<Progress> {
    const itemsNumber = stages.length;
    let itemsDone = 1;

    for (const stage of stages) {
      const state: Progress = {
        currentStageName: stage.name,
        itemsInProgress: itemsDone++,
        itemsNumber,
        message: 'In Progress',
        error: false,
        done: false,
      };
      try {
        callback(state);
        const db = await asyncDrizzle();
        const success = await transactionAsync(db, async (trx) => stage.action(userId, trx, (progress) => {
          callback({
            ...state,
            subItemsDone: progress.itemsDone,
            subItemsNumber: progress.itemsNumber,
          });
        }));
        if (!success) {
          const newState: Progress = {
            ...state,
            message: stage.errorMsg,
            error: true,
            done: true,
          };
          this.logger.info(newState.message);
          callback(newState);
          return newState;
        }
      } catch (e: unknown) {
        const errState: Progress = {
          ...state,
          message: 'Unknown Error',
          error: true,
          done: true,
        };
        this.logger.error('Error during syncing', {e, state: errState});
        callback(errState);
        return errState;
      }

    }
    const final: Progress = {
      currentStageName: stages[stages.length - 1]?.name ?? 'Done',
      itemsInProgress: itemsNumber,
      itemsNumber,
      error: false,
      message: finalMessage,
      done: true,
    };
    callback(final);
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
        name: 'Pulling Workout Types',
        errorMsg: "Couldn't pull workoutTypes",
        action: this.workoutTypeService.pullFromServer.bind(this.workoutTypeService),
      },
      {
        name: 'Pulling Food',
        action: this.foodService.pullFromServer.bind(this.foodService),
        errorMsg: "Couldn't pull foods",
      },
      {
        name: 'Pulling Entries',
        action: this.entryService.pullFromServer.bind(this.entryService),
        errorMsg: "Couldn't pull entries",
      },
      {
        name: 'Pushing Exercises',
        action: this.exerciseService.pushToServer.bind(this.exerciseService),
        errorMsg: "Couldn't push exercises",
      },
      {
        name: 'Pushing Food',
        action: this.foodService.pushToServer.bind(this.foodService),
        errorMsg: "Couldn't push food",
      },
      {
        name: 'Pushing Entries',
        action: this.entryService.pushToServer.bind(this.entryService),
        errorMsg: "Couldn't push entries",
      },

    ];
    return stages;
  }

  protected getWipeStages(): Stage[] {
    const stages: Stage[] = [
      {
        name: 'Wiping Entries',
        action: this.entryService.wipeLocalData.bind(this.entryService),
        errorMsg: "Couldn't delete entries",
      },
      {
        name: 'Wiping Workout Types',
        action: this.workoutTypeService.wipeLocalData.bind(this.workoutTypeService),
        errorMsg: "Couldn't delete workout types",
      },
      {
        name: 'Wiping Exercises',
        errorMsg: "Couldn't delete exercises",
        action: this.exerciseService.wipeLocalData.bind(this.exerciseService),
      },
      {
        name: 'Wiping Food',
        errorMsg: "Couldn't delete food",
        action: this.foodService.wipeLocalData.bind(this.foodService),
      },
    ];
    return stages;
  }
}
