import {getWorkouts, putWorkouts, WorkoutUpsertDto} from "@/openapi-client";
import {DrizzleDb, conflictUpdateSetAllColumns} from "../drizzle";
import {openApiRequest} from "../openApiRequest";
import {schema} from "@/db/schema";
import {NewModel} from "@/types/NewModel";
import {eq, inArray} from "drizzle-orm";
import {AppWorkout} from "@/types/models/AppWorkout";
import {AppWorkoutExercise} from "@/types/models/AppWorkoutExercise";
import {AppWorkoutExerciseSet} from "@/types/models/AppWorkoutExerciseSet";
import {Logger} from "../Logger/Logger";
import {processInBatches} from "../processInbatches";

export class WorkoutService {
  protected logger: Logger = new Logger(WorkoutService.name)

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    try {
      await db.delete(schema.workoutExerciseSets)
      await db.delete(schema.workoutExercises)
      await db.delete(schema.workouts)
    } catch(e: unknown){
      this.logger.error('Error during wiping local data',e)
      return false
    }
    return true;
  }

  async pushToServer(db: DrizzleDb,userId: number): Promise<boolean> {
    const lastUpdate = await this.getLatestPushSyncDate(db)
    const workouts = await db.query.workouts.findMany({
      with: {
       exercises: {
        with: {
          exercise: true,
          sets: true
        }
       }
      },
      where: (t,op) => op.and(
        op.eq(t.userId,userId),
        lastUpdate ? op.or(
          op.gt(t.updatedAt,lastUpdate),
          op.gt(t.createdAt,lastUpdate),
        ) : undefined
      )
    });
    if(workouts.length === 0) {
      return true;
    } 
    const data: WorkoutUpsertDto[] = []
    for(const workout of workouts){
      const workoutDto: WorkoutUpsertDto = {
        id: workout.externalId ?? undefined,
        typeId: workout.typeId,
        calories: workout.calories,
        start: workout.start,
        end: workout.end,
        exercises: [],
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
      }
      for(const exercise of workout.exercises){
        const  exerciseDto: WorkoutUpsertDto['exercises'][0] = {
          exerciseId: exercise.exercise.externalId ?? 0,
          sets: [],
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt
        }
        workoutDto.exercises.push(exerciseDto)
        for(const set of exercise.sets) {
          const setDto: WorkoutUpsertDto['exercises'][0]['sets'][0] = {
            start: set.start,
            end: set.end,
            weight: set.weight,
            reps: set.reps,
            createdAt: set.createdAt,
            updatedAt: set.updatedAt,
          }
          exerciseDto.sets.push(setDto)
        }
      }
      data.push(workoutDto)
    }
    const response = await putWorkouts({
      body: {
        items: data
      }
    })
    if(response.error){
      this.logger.error(null,response.error);
      throw new Error("Error during uploading");
    }
    
    const upsertedEntities = response.data.items
    for(const [i,workout] of workouts.entries()){
      if(!upsertedEntities[i]){
        throw new Error("Matching upserted entity not found")
      }
      workout.externalId = upsertedEntities[i].id
      workout.lastPushedAt = new Date();
    }
    await db.insert(schema.workouts).values(workouts).onConflictDoUpdate(
      {
        target: schema.workouts.id,
        set: conflictUpdateSetAllColumns(schema.workouts)
      }
    )
    return true;
  }

  async pullFromServer(db: DrizzleDb): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);
    const response = await openApiRequest(getWorkouts,{
      query: {
        updatedAfter: lastUpdateFromServer ?? undefined,
      }
    });
    if(response.error){
      return false;
    }
    if(response.data.items.length === 0){
      return true;
    }
    const workouts: NewModel<AppWorkout>[] = []
    const exercises: NewModel<AppWorkoutExercise>[] = [];
    const sets: NewModel<AppWorkoutExerciseSet>[] = []
    const externalExerciseIds: number[] = []
    for(const workout of response.data.items) {
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
      }
      workouts.push(newWorkoutRow);
      for(const row of workout.exercises){
        externalExerciseIds.push(row.exercise.id);
        exercises.push({
          externalId: row.id,
          userId: workout.userId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          workoutId: row.workoutId,
          exerciseId: row.exerciseId,
        });
        for(const set of row.sets){ 
          const newSetRow: NewModel<AppWorkoutExerciseSet> = {
            externalId: set.id,
            userId: workout.userId,
            start: set.start,
            end: set.end,
            createdAt: set.createdAt,
            updatedAt: set.updatedAt,
            workoutId: set.workoutId,
            exerciseId: set.exerciseId,
            weight: set.weight,
            finished: true, // todo: change that
            reps: set.reps,
            workoutExerciseId: set.workoutExerciseId
          }
          sets.push(newSetRow);
        }
    }
  }
  const libraryExercises = await db.query.exercises.findMany({
    columns: {
      id: true,
      externalId: true,
    },
    where: (t, op) => op.inArray(t.externalId,externalExerciseIds)
  })
  await db.transaction(async db => {
    const savedWorkouts = await this.saveWorkouts(db,workouts);
    const workoutIds = savedWorkouts.map(x => x.id);
    await db.delete(schema.workoutExerciseSets).where(
      inArray(schema.workoutExerciseSets.workoutId,workoutIds)
    );
    await db.delete(schema.workoutExercises).where(
      inArray(schema.workoutExercises.workoutId,workoutIds)
    );
    const workoutMap = savedWorkouts.reduce((acc,cur)=> acc.set(cur.externalId ?? 0,cur), new Map<number,AppWorkout>());
    const libraryExerciseMap = libraryExercises.reduce((acc,cur) => acc.set(cur.externalId ?? 0,cur.id), new Map<number,number>())
    const finalizedExercises = exercises.map( exercise => {
        const localExerciseId = libraryExerciseMap.get(exercise.exerciseId)
        if(!localExerciseId){
          throw new Error("Exercise not found")
        }
          const savedWorkout = workoutMap.get(exercise.workoutId);
          if(!savedWorkout){
            throw new Error(`Workout ${exercise.workoutId} not found for exercise ${exercise.externalId}`)
          }
      return {
        ...exercise,
        workoutId: savedWorkout.id,
        exerciseId: localExerciseId,
      }
    })
    const savedWorkoutExercises =  await this.saveExercises(db,finalizedExercises);
    const workoutExerciseMap = savedWorkoutExercises.reduce((acc,cur)=> acc.set(cur.externalId ?? 0,cur), new Map<number,AppWorkoutExercise>());
    const finalizedExerciseSets = sets.map(set => {
      const localExerciseId = libraryExerciseMap.get(set.exerciseId)
      if(!localExerciseId){
        throw new Error("Exercise not found")
      }
      const savedWorkout = workoutMap.get(set.workoutId);
      if(!savedWorkout){
        throw new Error(`Workout ${set.workoutId} not found for exercise ${set.externalId}`)
      }
      const savedWorkoutExercise = workoutExerciseMap.get(set.workoutExerciseId);
      if(!savedWorkoutExercise){
        throw new Error(`Workout exercise ${set.workoutId} not found for set: ${set.workoutExerciseId}`)
      }
      return {
        ...set,
        workoutId: savedWorkout.id,
        exerciseId: localExerciseId,
        workoutExerciseId: savedWorkoutExercise.id,
      }
    })
    await this.saveSets(db,finalizedExerciseSets)
  })
    return true;
  }

  protected async getLatestPullSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.workouts.findFirst({
      columns: {
        lastPulledAt: true,
      },
      orderBy: (t,op) => [op.desc(t.lastPulledAt)]
    })
    if(!row){
      return null;
    }
    return row.lastPulledAt
  }

  protected async getLatestPushSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.workouts.findFirst({
      columns: {
        lastPushedAt: true,
      },
      orderBy: (t,op) => [op.desc(t.lastPushedAt)]
    })
    if(!row){
      return null;
    }
    return row.lastPushedAt
  }

  protected async saveWorkouts(db: DrizzleDb, workouts: NewModel<AppWorkout>[]): Promise<AppWorkout[]> {
    const result = await processInBatches(workouts,200, async (rows) => {
      const res = await db.insert(schema.workouts).values(rows).onConflictDoUpdate({
        target: schema.workouts.externalId,
        set: conflictUpdateSetAllColumns(schema.workouts),
      }).returning()
      return res;
    })
    return result
  }
  protected async saveExercises(db: DrizzleDb, exercises: NewModel<AppWorkoutExercise>[]): Promise<AppWorkoutExercise[]> {
    const result = await processInBatches(exercises,200, async (rows) => {
      const res = await db.insert(schema.workoutExercises).values(rows).onConflictDoUpdate({
        target: schema.workoutExercises.externalId,
        set: conflictUpdateSetAllColumns(schema.workoutExercises)
      }).returning()
      return res;
    })
    return result
  }

  protected async saveSets(db: DrizzleDb, sets: NewModel<AppWorkoutExerciseSet>[]): Promise<AppWorkoutExerciseSet[]> {
    const result = await processInBatches(sets,200, async (rows) => {
      const res = await db.insert(schema.workoutExerciseSets).values(rows).onConflictDoUpdate({
        target: schema.workoutExerciseSets.externalId,
        set: conflictUpdateSetAllColumns(schema.workoutExerciseSets)
      }).returning()
      return res;
    })
    return result
  }

  protected async saveWorkoutToDb(db: DrizzleDb, externalId: number, workout: NewModel<AppWorkout>): Promise<number> {
    const existing = await db.query.workouts.findFirst({
      where: (t,op) => op.eq(t.externalId,externalId)
    })
    if(existing){
      await db.update(schema.workouts).set({
        ...workout,
        updatedAt: new Date(),
      }).where(
        eq(schema.workouts.externalId,externalId)
      )
    }
    const result = await db.insert(schema.workouts).values(workout).returning({
      id: schema.workouts.id
    })
    const insertedId = result[0]?.id;
    if(!insertedId){
      throw new Error(`Couldn't insert workout ${externalId}`)
    }
    return insertedId;
  }

  protected async saveExerciseToDb(db: DrizzleDb, exercise: NewModel<AppWorkoutExercise>): Promise<number> {
    const result = await db.insert(schema.workoutExercises).values(exercise).returning({
      id: schema.workoutExercises.id
    })
    const insertedId = result[0]?.id;
    if(!insertedId){
      throw new Error(`Couldn't insert workout exercise`)
    }
    return insertedId;
  }
}