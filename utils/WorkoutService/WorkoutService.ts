import {getWorkouts, putWorkouts, Workout, WorkoutUpsertDto} from '@/openapi-client';
import {DrizzleDb, conflictUpdateSetAllColumns} from '../drizzle';
import {schema} from '@/db/schema';
import {NewModel} from '@/types/NewModel';
import {eq} from 'drizzle-orm';
import {AppWorkout, CompleteAppWorkout} from '@/types/models/AppWorkout';
import {AppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {AppWorkoutExerciseSet} from '@/types/models/AppWorkoutExerciseSet';
import {Logger} from '../Logger/Logger';
import {processInBatches} from '../processInBatches';
let counter = 0;
export class WorkoutService {
  protected logger: Logger = new Logger(WorkoutService.name);

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    try {
      await db.delete(schema.workoutExerciseSets);
      await db.delete(schema.workoutExercises);
      await db.delete(schema.workouts);
    } catch (e: unknown) {
      this.logger.error('Error during wiping local data', e);
      return false;
    }
    return true;
  }

  transformSetWeight(val: string): number {
    const conventional = val.replaceAll(',', '.');
    const number = Number.parseFloat(conventional);
    return isNaN(number) ? 0 : number;
  }

  async pushWorkout(db: DrizzleDb, workout: CompleteAppWorkout): Promise<boolean> {
    return this.pushWorkouts(db, [workout]);
  }

  async pushToServer(db: DrizzleDb, userId: number): Promise<boolean> {
    const lastUpdate = await this.getLatestPushSyncDate(db);
    const workouts = await db.query.workouts.findMany({
      with: {
        exercises: {
          with: {
            exercise: true,
            sets: {
              orderBy: (t, op) => [
                op.asc(t.createdAt),
              ],
            },
          },
          orderBy: (t, op) => [
            op.asc(t.createdAt),
          ],
        },
      },
      where: (t, op) => op.and(
        op.eq(t.userId, userId),
        lastUpdate ? op.or(
          op.gt(t.updatedAt, lastUpdate),
          op.gt(t.createdAt, lastUpdate),
        ) : undefined
      ),
      orderBy: (t, op) => [
        op.desc(t.updatedAt),
        op.desc(t.createdAt),
      ],
    });
    return this.pushWorkouts(db, workouts);
  }
  protected async pushWorkouts(db: DrizzleDb, workouts: CompleteAppWorkout[]): Promise<boolean> {

    if (workouts.length === 0) {
      return true;
    }
    const data: WorkoutUpsertDto[] = [];
    for (const workout of workouts) {
      const workoutDto: WorkoutUpsertDto = {
        id: workout.externalId ?? undefined,
        typeId: workout.typeId,
        calories: workout.calories,
        start: workout.start,
        end: workout.end,
        exercises: [],
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
        deletedAt: workout.deletedAt,
      };
      for (const exercise of workout.exercises) {
        const exerciseDto: WorkoutUpsertDto['exercises'][0] = {
          exerciseId: exercise.exercise.externalId ?? 0,
          sets: [],
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        };
        workoutDto.exercises.push(exerciseDto);
        for (const set of exercise.sets) {
          const setDto: WorkoutUpsertDto['exercises'][0]['sets'][0] = {
            start: set.start,
            end: set.end,
            weight: set.weight,
            reps: set.reps,
            createdAt: set.createdAt,
            updatedAt: set.updatedAt,
          };
          exerciseDto.sets.push(setDto);
        }
      }
      data.push(workoutDto);
    }
    const response = await putWorkouts({
      body: {
        items: data,
      },
    });
    if (response.error) {
      this.logger.error(null, response.error);
      throw new Error('Error during uploading');
    }

    const upsertedEntities = response.data.items;
    for (const [i, workout] of workouts.entries()) {
      if (!upsertedEntities[i]) {
        throw new Error('Matching upserted entity not found');
      }
      workout.externalId = upsertedEntities[i].id;
      workout.lastPushedAt = new Date();
    }
    await db.insert(schema.workouts).values(workouts).onConflictDoUpdate(
      {
        target: schema.workouts.id,
        set: conflictUpdateSetAllColumns(schema.workouts),
      }
    );
    return true;
  }

  protected async processedPulledItem(db: DrizzleDb, items: Workout[]): Promise<void> {
    for (const workout of items) {
    // --- save workout first ---
      const newWorkoutRow: NewModel<AppWorkout> = {
        externalId: workout.id,
        typeId: workout.typeId,
        userId: workout.userId,
        calories: workout.calories,
        start: workout.start,
        end: workout.end,
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
        lastPulledAt: new Date(),
        lastPushedAt: new Date(),
        deletedAt: workout.deletedAt,
      };

    // upsert workout and get local id
      const savedWorkoutId = await this.saveWorkoutToDb(db, workout.id, newWorkoutRow);

    // clean up existing children before inserting fresh ones
      await db.delete(schema.workoutExerciseSets).where(eq(schema.workoutExerciseSets.workoutId, savedWorkoutId));
      await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, savedWorkoutId));

    // we need exercise id mapping from library
      const externalExerciseIds = workout.exercises.map((e) => e.exercise.id);
      const libraryExercises = await db.query.exercises.findMany({
        columns: {id: true, externalId: true},
        where: (t, op) => op.inArray(t.externalId, externalExerciseIds),
      });
      const libraryExerciseMap = new Map(libraryExercises.map((e) => [e.externalId ?? 0, e.id]));

    // --- save exercises + sets one by one ---
      for (const row of workout.exercises) {
        const localExerciseId = libraryExerciseMap.get(row.exercise.id);
        if (!localExerciseId) {
          throw new Error(`Exercise not found ${row.exercise.id}`);
        }

        const newExerciseRow: NewModel<AppWorkoutExercise> = {
          externalId: counter++, // no externalId in API
          userId: workout.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          workoutId: savedWorkoutId,
          exerciseId: localExerciseId,
        };

        const savedExerciseId = await this.saveExerciseToDb(db, newExerciseRow);

      // save sets
        for (const set of row.sets) {
          const newSetRow: NewModel<AppWorkoutExerciseSet> = {
            externalId: counter++, // no externalId in API
            userId: workout.userId,
            start: set.start,
            end: set.end,
            createdAt: new Date(),
            updatedAt: new Date(),
            workoutId: savedWorkoutId,
            exerciseId: localExerciseId,
            finished: true, // todo
            reps: set.reps,
            weight: set.weight,
            workoutExerciseId: savedExerciseId,
          };

          await db.insert(schema.workoutExerciseSets).values(newSetRow);
        }
      }
    }
  }


  async pullFromServer(db: DrizzleDb): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);
    // const result = await db.transaction(async (db) => {
    let page = 1;
          // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await getWorkouts({
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
    // });
    // return result;
  }

  protected async getLatestPullSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.workouts.findFirst({
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

  protected async getLatestPushSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.workouts.findFirst({
      columns: {
        lastPushedAt: true,
      },
      orderBy: (t, op) => [op.desc(t.lastPushedAt)],
    });
    if (!row) {
      return null;
    }
    return row.lastPushedAt;
  }

  protected async saveWorkouts(db: DrizzleDb, workouts: NewModel<AppWorkout>[]): Promise<AppWorkout[]> {

    const result = await processInBatches(workouts, 200, async (rows) => {
      const res = await db.insert(schema.workouts).values(rows)
        // .onConflictDoUpdate({
        //   target: schema.workouts.externalId,
        //   set: conflictUpdateSetAllColumns(schema.workouts),
        // })
        .returning();
      return res;
    });
    return result;
  }
  protected async saveExercises(db: DrizzleDb, exercises: NewModel<AppWorkoutExercise>[]): Promise<AppWorkoutExercise[]> {
    const result = await processInBatches(exercises, 200, async (rows) => {
      const res = await db.insert(schema.workoutExercises).values(rows)
        // .onConflictDoUpdate({
        //   target: schema.workoutExercises.externalId,
        //   set: conflictUpdateSetAllColumns(schema.workoutExercises),
        // })
        .returning();
      return res;
    });
    return result;
  }

  protected async saveSets(db: DrizzleDb, sets: NewModel<AppWorkoutExerciseSet>[]): Promise<AppWorkoutExerciseSet[]> {
    const result = await processInBatches(sets, 200, async (rows) => {
      const res = await db.insert(schema.workoutExerciseSets).values(rows).onConflictDoUpdate({
        target: schema.workoutExerciseSets.externalId,
        set: conflictUpdateSetAllColumns(schema.workoutExerciseSets),
      }).returning();
      return res;
    });
    return result;
  }

  protected async saveWorkoutToDb(db: DrizzleDb, externalId: number, workout: NewModel<AppWorkout>): Promise<number> {
    const existing = await db.query.workouts.findFirst({
      where: (t, op) => op.eq(t.externalId, externalId),
    });
    if (existing) {
      await db.update(schema.workouts).set({
        ...workout,
        updatedAt: new Date(),
      }).where(
        eq(schema.workouts.externalId, externalId)
      );
    }
    const result = await db.insert(schema.workouts).values(workout).returning({
      id: schema.workouts.id,
    });
    const insertedId = result[0]?.id;
    if (!insertedId) {
      throw new Error(`Couldn't insert workout ${externalId}`);
    }
    return insertedId;
  }

  protected async saveExerciseToDb(db: DrizzleDb, exercise: NewModel<AppWorkoutExercise>): Promise<number> {
    const result = await db.insert(schema.workoutExercises).values(exercise).returning({
      id: schema.workoutExercises.id,
    });
    const insertedId = result[0]?.id;
    if (!insertedId) {
      throw new Error('Couldn\'t insert workout exercise');
    }
    return insertedId;
  }
}
