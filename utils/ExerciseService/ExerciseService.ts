import {AppExercise} from "@/types/models/AppExercise";
import {NestedAppExercise} from "./types/NestedAppExercise";
import {getExercises} from "@/openapi-client";
import {openApiRequest} from "../openApiRequest";
import {schema} from "@/db/schema";
import {NewModel} from "@/types/NewModel";
import {conflictUpdateSetAllColumns, DrizzleDb} from "../drizzle";
import {Logger} from "../Logger/Logger";
import {processInBatches} from "../processInbatches";


export class ExerciseService {
  protected logger: Logger = new Logger(ExerciseService.name)

  processExerciseList(
    exercises: AppExercise[], 
    opts?: { 
      nameFilter?: string
    }
  ): {builtIn: NestedAppExercise[], personal: AppExercise[]}  {
    const map = new Map<number, AppExercise[]>();
    const primaryExercises: AppExercise[] = [];
    const personalExercises: AppExercise[] = [];
    const search = opts?.nameFilter ?? null;
    for (const exercise of exercises) {
      if(exercise.name.trim() === ''){
        continue;
      }
      if (search !== null && !exercise.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
        continue;
      }
      if (exercise.userId !== null) {
        personalExercises.push(exercise);
        continue;
      }
  
      if (exercise.parentExerciseId === null) {
        if (search !== null && !exercise.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
          continue;
        }
        primaryExercises.push(exercise);
        continue;
      }
  
      const existing = map.get(exercise.parentExerciseId) ?? [];
      existing.push(exercise);
      map.set(exercise.parentExerciseId, existing);
    }
    const nestedExercises = primaryExercises.map((item) => {
      let variations = map.get(item.externalId ?? 0);
      if(variations && variations.length === 1){
        variations = undefined;
      }
      return {
        ...item,
        variations,
      }
    }
    );
    return {builtIn: nestedExercises, personal: personalExercises}
  }

  createSectionListData(exercises: NestedAppExercise[]): {title: string, data: NestedAppExercise[]}[] {
    const sectionMap = new Map<string, NestedAppExercise[]>();
    for(const row of exercises){
      const firstLetter =  row.name.charAt(0).toLowerCase()
      const value = sectionMap.get(firstLetter) ?? []
      value.push(row)
      sectionMap.set(firstLetter,value)
    }
  
    const items =  Array.from(sectionMap.entries()).map( val => ({
      title: val[0],
      data: val[1],
    }))
    return items;
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    try {
      await db.delete(schema.exercises)
    } catch(e: unknown){
      this.logger.error('Error during wiping local data',e)
      return false
    }
    return true;
  }
  async syncWithServer(db: DrizzleDb): Promise<boolean> {
    const response = await openApiRequest(getExercises,{});
    if(response.error){
      return false;
    }
    const newRows: NewModel<AppExercise>[] = Array(response.data.items.length)
    let i = 0;
    for(const exercise of response.data.items) {
      const newRow: NewModel<AppExercise> = {
        params: exercise.params,
        name: exercise.name,
        description: exercise.description,
        difficulty: exercise.difficulty,
        equipmentId: exercise.equipmentId,
        images: exercise.images,
        userId: exercise.userId,
        copiedFromId: exercise.copiedFromId,
        parentExerciseId: exercise.parentExerciseId,
        createdAt: new Date(),
        updatedAt: null,
        externalId: exercise.id
      }
      newRows[i++] = newRow
    }
    await processInBatches(newRows,200, async (rows) => {
      await db.insert(schema.exercises).values(rows).onConflictDoUpdate({
        target: schema.exercises.externalId,
        set: conflictUpdateSetAllColumns(schema.exercises)
      })
      return true;
    })
    return true;
  }
}