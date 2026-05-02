import {getWorkouts, Workout} from '@/openapi-client';
import {DrizzleDb} from '../drizzle';
import {schema} from '@/db/schema';
import {NewModel} from '@/types/NewModel';
import {eq} from 'drizzle-orm';
import {AppWorkout, CompleteAppWorkout} from '@/types/models/AppWorkout';
import {AppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {AppWorkoutExerciseSet} from '@/types/models/AppWorkoutExerciseSet';
import {Logger} from '../Logger/Logger';

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

  async copyWorkout(workout: CompleteAppWorkout, db: DrizzleDb): Promise<CompleteAppWorkout> {
    const now = new Date();
    const newWorkout: NewModel<AppWorkout> = {
      externalId: null,
      createdAt: now,
      updatedAt: null,
      deletedAt: null,
      lastPulledAt: null,
      lastPushedAt: null,
      start: now,
      end: null,
      userId: workout.userId,
      typeId: workout.typeId,
      calories: 0,
    };
    const insertedRow = await db.insert(schema.workouts)
        .values(newWorkout);
    const newWorkoutId = insertedRow.lastInsertRowId;
    for (const exercise of workout.exercises) {
      const newExercise: NewModel<AppWorkoutExercise> = {
          // externalId: null,
        userId: exercise.userId,
        createdAt: exercise.createdAt,
        updatedAt: null,
        workoutId: newWorkoutId,
        exerciseId: exercise.exerciseId,
      };
      await db.insert(schema.workoutExercises).values(newExercise).returning();
    }
    const result = await this.getWorkout(db, newWorkoutId);
    if (!result) {
      throw new Error('Workout not found');
    }
    return result;
  }
  async getWorkout(db: DrizzleDb, id: number): Promise<CompleteAppWorkout| null> {
    const workout = await db.query.workouts.findFirst({
      where: (t, op) => op.eq(t.id, id),
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
    },);
    return workout ?? null;
  }

  async processedPulledItem(db: DrizzleDb, items: Workout[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();

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
      map.set(workout.id, savedWorkoutId);

    // clean up existing children before inserting fresh ones
      await db.delete(schema.workoutExerciseSets).where(eq(schema.workoutExerciseSets.workoutId, savedWorkoutId));
      await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, savedWorkoutId));

    // we need exercise id mapping from library
      // const externalExerciseIds = workout.exercises.map((e) => e.exercise.id);
      // const libraryExercises = await db.query.exercises.findMany({
      //   columns: {id: true, externalId: true},
      //   where: (t, op) => op.inArray(t.externalId, externalExerciseIds),
      // });
      // const libraryExerciseMap = new Map(libraryExercises.map((e) => [e.externalId ?? 0, e.id]));

    // --- save exercises + sets one by one ---
      for (const row of workout.exercises) {
        // const localExerciseId = libraryExerciseMap.get(row.exercise.id);
        // if (!localExerciseId) {
        //   throw new Error(`Exercise not found ${row.exercise.id}`);
        // }

        const newExerciseRow: NewModel<AppWorkoutExercise> = {
          // externalId: counter++, // no externalId in API
          userId: workout.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          workoutId: savedWorkoutId,
          exerciseId: row.exercise.id,
        };

        const savedExerciseId = await this.saveExerciseToDb(db, newExerciseRow);

      // save sets
        for (const set of row.sets) {
          const newSetRow: NewModel<AppWorkoutExerciseSet> = {
            // externalId: counter++, // no externalId in API
            userId: workout.userId,
            start: set.start,
            end: set.end,
            createdAt: new Date(),
            updatedAt: new Date(),
            workoutId: savedWorkoutId,
            exerciseId: row.exercise.id,
            finished: true, // todo
            reps: set.reps,
            weight: set.weight,
            workoutExerciseId: savedExerciseId,
          };

          await db.insert(schema.workoutExerciseSets).values(newSetRow);
        }
      }
    }
    return map;
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

  // protected async saveWorkouts(db: DrizzleDb, workouts: NewModel<AppWorkout>[]): Promise<AppWorkout[]> {

  //   const result = await processInBatches(workouts, 200, async (rows) => {
  //     const res = await db.insert(schema.workouts).values(rows)
  //       // .onConflictDoUpdate({
  //       //   target: schema.workouts.externalId,
  //       //   set: conflictUpdateSetAllColumns(schema.workouts),
  //       // })
  //       .returning();
  //     return res;
  //   });
  //   return result;
  // }
  // protected async saveExercises(db: DrizzleDb, exercises: NewModel<AppWorkoutExercise>[]): Promise<AppWorkoutExercise[]> {
  //   const result = await processInBatches(exercises, 200, async (rows) => {
  //     const res = await db.insert(schema.workoutExercises).values(rows)
  //       // .onConflictDoUpdate({
  //       //   target: schema.workoutExercises.externalId,
  //       //   set: conflictUpdateSetAllColumns(schema.workoutExercises),
  //       // })
  //       .returning();
  //     return res;
  //   });
  //   return result;
  // }

  // protected async saveSets(db: DrizzleDb, sets: NewModel<AppWorkoutExerciseSet>[]): Promise<AppWorkoutExerciseSet[]> {
  //   const result = await processInBatches(sets, 200, async (rows) => {
  //     const res = await db.insert(schema.workoutExerciseSets).values(rows).onConflictDoUpdate({
  //       target: schema.workoutExerciseSets.externalId,
  //       set: conflictUpdateSetAllColumns(schema.workoutExerciseSets),
  //     }).returning();
  //     return res;
  //   });
  //   return result;
  // }

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
      return existing.id;
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
