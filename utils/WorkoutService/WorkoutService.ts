import {getWorkouts} from "@/openapi-client";
import {DrizzleDb} from "../drizzle";
import {openApiRequest} from "../openApiRequest";
import {schema} from "@/db/schema";
import {NewModel} from "@/types/NewModel";
import {eq} from "drizzle-orm";
import {AppWorkout} from "@/types/models/AppWorkout";
import {AppWorkoutExercise} from "@/types/models/AppWorkoutExercise";
import {AppWorkoutExerciseSet} from "@/types/models/AppWorkoutExerciseSet";
import {Logger} from "../Logger/Logger";

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

  async syncWithServer(db: DrizzleDb): Promise<boolean> {
    const response = await openApiRequest(getWorkouts,{});
    
    if(response.error){
      return false;
    }
    for(const workout of response.data.items) {
      this.logger.debug('Processing workout: ',{workout, type: typeof workout.start })
      const newWorkoutRow: NewModel<AppWorkout> = {
        externalId: workout.id,
        typeId: workout.typeId,
        userId: workout.userId,
        calories: workout.calories,
        start: workout.start,
        end: workout.end,
        createdAt: new Date(),
        updatedAt: null,
        syncedAt: null
      }
      const workoutId = await this.saveWorkoutToDb(db,workout.id,newWorkoutRow);
      await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.id,workoutId))
      await db.delete(schema.workoutExerciseSets).where(eq(schema.workoutExerciseSets.id,workoutId))
      for(const row of workout.exercises){
        const exercise = await db.query.exercises.findFirst({
          where: (t,op) => op.eq(t.externalId,row.exercise.id)
        })
        if(!exercise){
          throw new Error(`Library exercise '${row.exercise.id}' not found`)
        }
        const newExerciseRow: NewModel<AppWorkoutExercise> = {
          externalId: row.id,
          userId: workout.userId,
          createdAt: new Date(),
          updatedAt: null,
          workoutId: workoutId,
          exerciseId: exercise.id,
        }
        const exerciseRow = await db.insert(schema.workoutExercises).values(newExerciseRow);
        for(const set of row.sets){
          const newSetRow: NewModel<AppWorkoutExerciseSet> = {
            externalId: set.id,
            userId: workout.userId,
            start: set.start,
            end: set.end,
            createdAt: new Date(),
            updatedAt: null,
            workoutId: workoutId,
            exerciseId: exercise.id,
            weight: set.weight,
            finished: true, // todo: change that
            reps: set.reps,
            workoutExerciseId: exerciseRow.lastInsertRowId,
          }
          await db.insert(schema.workoutExerciseSets).values(newSetRow);
          this.logger.info('done')
        }
      }
    }
    return true;
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