import {getWorkoutTypes, WorkoutType} from '@/openapi-client';
import {AsyncDrizzleDb, db, DrizzleDb} from '../drizzle';
import {WorkoutTypeRow} from './types/WorkoutTypeRow';
import {NewModel} from '@/types/NewModel';
import {WorkoutTypeExerciseSetRow} from './types/WorkoutTypeExerciseSetRow';
import {ExerciseService} from '../ExerciseService/ExerciseService';
import {WorkoutTypeExerciseRow} from './types/WorkoutTypeExerciseRow';
import {AppWorkoutType} from './types/AppWorkoutType';
import {Logger} from '../Logger/Logger';
import {transactionAsync} from '../runTransaction';

export class WorkoutTypeService {
  protected exerciseService: ExerciseService;
  protected logger: Logger = new Logger(WorkoutTypeService.name);

  constructor(exerciseService: ExerciseService) {
    this.exerciseService = exerciseService;
  }

  public async getPage(): Promise<AppWorkoutType[]> {
    const response = await db.query.workoutTypes.findMany({
      orderBy: (t, op) => op.desc(t.createdAt),
    });
    const result: AppWorkoutType[] = response.map((x) => ({
      ...x,
      exercises: [],
    }));
    return result;
  }
  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    try {
      await db.delete(db._.fullSchema.workoutTypeExerciseSets);
      await db.delete(db._.fullSchema.workoutTypeExercises);
      await db.delete(db._.fullSchema.workoutTypes);
    } catch (e: unknown) {
      this.logger.error('Error during wiping local data', e);
      return false;
    }
    return true;
  }
  protected async processedPulledItem(db: DrizzleDb, items: WorkoutType[]): Promise<void> {
    const sets: NewModel<WorkoutTypeExerciseSetRow>[] = [];
    for (const remoteWorkoutType of items) {
      const newWorkoutRow: NewModel<WorkoutTypeRow> = {
        externalId: remoteWorkoutType.id,
        userId: remoteWorkoutType.userId,
        createdAt: remoteWorkoutType.createdAt,
        updatedAt: remoteWorkoutType.updatedAt,
        lastPulledAt: new Date(),
        lastPushedAt: new Date(),
        deletedAt: remoteWorkoutType.deletedAt,
        name: remoteWorkoutType.name,
        planIndex: remoteWorkoutType.planId,
        planId: remoteWorkoutType.planIndex,
        description: remoteWorkoutType.description,
      };

      const ret = await db.insert(db._.fullSchema.workoutTypes).values(newWorkoutRow).returning();
      const insertedWorkoutType = ret[0];
      if (!insertedWorkoutType) {
        throw new Error('Unable to insert workout type');
      }
      for (const remoteExercise of remoteWorkoutType.exercises) {
        const localExercise = await this.exerciseService.findByExternalId(remoteExercise.exercise.id);
        const newExerciseRow: NewModel<WorkoutTypeExerciseRow> = {
          updatedAt: new Date(),
          userId: insertedWorkoutType.userId,
          createdAt: new Date(),
          deletedAt: null,
          index: remoteExercise.index,
          workoutTypeId: insertedWorkoutType.id,
          exerciseId: localExercise.id,
        };
        const inserted = await db.insert(db._.fullSchema.workoutTypeExercises).values(newExerciseRow).returning();
        const insertedExercise = inserted[0];
        if (!insertedExercise) {
          throw new Error('Unable to insert workout type exercise');
        }
        for (const remoteSet of remoteExercise.sets) {
          const newSetRow: NewModel<WorkoutTypeExerciseSetRow> = {
            userId: insertedWorkoutType.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            exerciseId: localExercise.id,
            reps: remoteSet.reps,
            workoutTypeId: insertedWorkoutType.id,
            workoutTypeExerciseId: insertedExercise.id,
          };
          sets.push(newSetRow);
        }
        await db.insert(db._.fullSchema.workoutTypeExerciseSets).values(sets);
      }
    }
  }

  async pullFromServer(db: AsyncDrizzleDb): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);
    const result = await transactionAsync(db, async (db) => {
      let page = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await getWorkoutTypes({
          query: {
            updatedAfter: lastUpdateFromServer ?? undefined,
            page: page++,
          },
        });
        if (response.error) {
          return false;
        }
        await this.processedPulledItem(db, response.data.items);
        if (response.data.items.length < response.data.info.pageSize) {
          return true;
        }
      }
    });
    return result;

  }

  async getLatestPullSyncDate(db: DrizzleDb) {
    const row = await db.query.workoutTypes.findFirst({
      columns: {
        lastPulledAt: true,
      },
      orderBy: (t, op) => [op.desc(t.lastPulledAt)],
    });
    if (!row) {
      return null;
    }
    return row.lastPulledAt;
  }
}
