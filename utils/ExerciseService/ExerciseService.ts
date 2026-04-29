import {AppExercise} from '@/types/models/AppExercise';
import {NestedAppExercise} from './types/NestedAppExercise';
import {Exercise, ExerciseUpsertDto, getExercises, Muscle, putExercises} from '@/openapi-client';
import {openApiRequest} from '../openApiRequest';
import {schema} from '@/db/schema';
import {NewModel} from '@/types/NewModel';
import {AsyncDrizzleDb, conflictUpdateSetAllColumns, db, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {transactionAsync} from '../runTransaction';
import {AppExerciseMuscle} from '../../types/models/AppExerciseMuscle';
import {eq} from 'drizzle-orm';
import {StageProgressCallback} from '../SyncService/types/StageProgressCallback';

export class ExerciseService {

  async getExercise(exerciseId: number): Promise<Exercise> {
    const row = await db.query.exercises.findFirst({
      where: (t, op) => op.eq(t.id, exerciseId),
    });
    if (!row) {
      throw new Error('Exercise not found');
    }
    const muscleRows = await db.query.exerciseMuscle.findMany({
      where: (t, op) => op.eq(t.exerciseId, exerciseId),
      orderBy: (t, op) => op.asc(t.id),
    });
    console.log(muscleRows);
    const result: Exercise = {
      ...row,
      isArchived: false,
      muscles: {
        primary: muscleRows.filter((x) => x.isPrimary).map((x) => x.muscle),
        secondary: muscleRows.filter((x) => !x.isPrimary).map((x) => x.muscle),
      },
      variations: [],
    };
    return result;
  }

  async getPersonalLibrary(params: {presonal?: boolean, search?: string;}): Promise<Exercise[]> {
    const items = await db.query.exercises.findMany({
      where: (t, op) => op.and(
        params.presonal ? op.not(op.isNull(t.userId)) : op.isNull(t.userId),
        ...((() => {
          if (!params.search) {
            return [];
          }
          return params.search.trim().split(' ').map((search) => op.like(db._.fullSchema.exercises.name, `%${search}%`));
        })()),
        op.isNull(t.deletedAt)
      ),
    });
    let result: NestedAppExercise[] = items;
    if (!params.presonal) {
      result = [];
      const map = items.reduce(
        (acc, item) => item.externalId ? acc.set(item.externalId, item) : acc,
        new Map<number, NestedAppExercise>()
      );

      for (const item of items) {
        if (!item.parentExerciseId) {
          result.push(item);
          continue;
        }
        const value = map.get(item.parentExerciseId);
        if (!value) {
          // console.log(`Parent not found for ${item.parentExerciseId}`);
          continue;
          // throw new Error('Parent exercise not found');
        }
        const variations = value.variations ?? [];
        variations.push(item);
        value.variations = variations;
      }
    }
    const exIds = result.flatMap((x) => [x.id, ...(x.variations?.map((x) => x.id) ?? [])]);
    const muscles = await db.query.exerciseMuscle.findMany({
      where: (t, op) => op.inArray(t.exerciseId, exIds),
    });

    const primaryMuscles = new Map<number, Muscle[]>();
    const secondaryMuscles = new Map<number, Muscle[]>();
    for (const muscleRow of muscles) {
      // eslint-disable-next-line max-len
      if (muscleRow.isPrimary) {
        const arr = primaryMuscles.get(muscleRow.exerciseId) ?? [];
        arr.push(muscleRow.muscle);
        primaryMuscles.set(muscleRow.exerciseId, arr);
        continue;
      }
      const arr = secondaryMuscles.get(muscleRow.exerciseId) ?? [];
      arr.push(muscleRow.muscle);
      secondaryMuscles.set(muscleRow.exerciseId, arr);
    }

    const nested: Exercise[] = [];
    for (const row of result) {
      const exercise: Exercise = {
        ...row,
        isArchived: false,
        muscles: {
          primary: primaryMuscles.get(row.id) ?? [],
          secondary: secondaryMuscles.get(row.id) ?? [],
        },
        variations: (row.variations ?? []).map((x) => ({
          ...x,
          isArchived: false,
          muscles: {
            primary: primaryMuscles.get(x.id) ?? [],
            secondary: secondaryMuscles.get(x.id) ?? [],
          },
        })),
      };
      nested.push(exercise);
    }
    return nested;
  }

  async findByExternalId(id: number): Promise<AppExercise> {
    const res = await db.query.exercises.findFirst({
      where: (t, op) => op.eq(t.externalId, id),
    });
    if (!res) {
      throw new Error('Exercise not found');
    }
    return res;
  }
  protected logger: Logger = new Logger(ExerciseService.name);

  processExerciseList(
    exercises: AppExercise[],
    opts?: {
      nameFilter?: string
    }
  ): {builtIn: NestedAppExercise[], personal: AppExercise[]} {
    const map = new Map<number, AppExercise[]>();
    const primaryExercises: AppExercise[] = [];
    const personalExercises: AppExercise[] = [];
    const search = opts?.nameFilter ?? null;
    for (const exercise of exercises) {
      if (exercise.name.trim() === '') {
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
      if (variations && variations.length === 1) {
        variations = undefined;
      }
      return {
        ...item,
        variations,
      };
    }
    );
    return {builtIn: nestedExercises, personal: personalExercises};
  }

  createSectionListData(exercises: NestedAppExercise[]): {title: string, data: NestedAppExercise[]}[] {
    const sectionMap = new Map<string, NestedAppExercise[]>();
    for (const row of exercises) {
      const firstLetter = row.name.charAt(0).toLowerCase();
      const value = sectionMap.get(firstLetter) ?? [];
      value.push(row);
      sectionMap.set(firstLetter, value);
    }

    const items = Array.from(sectionMap.entries()).map((val) => ({
      title: val[0],
      data: val[1],
    }));
    return items;
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    try {
      await db.delete(schema.exercises);
    } catch (e: unknown) {
      this.logger.error('Error during wiping local data', e);
      return false;
    }
    return true;
  }
  async pushToServer(db: DrizzleDb, userId: number): Promise<boolean> {
    const lastUpdate = await this.getLatestPushSyncDate(db);
    const exercises = await db.query.exercises.findMany({
      where: (t, op) => op.and(
        op.eq(t.userId, userId),
        lastUpdate ? op.or(
          op.gt(t.updatedAt, lastUpdate),
          op.gt(t.createdAt, lastUpdate),
        ) : undefined
      ),
    });
    if (exercises.length === 0) {
      return true;
    }
    const rows: ExerciseUpsertDto[] = exercises.map((exercise) => ({
      ...exercise,
      isArchived: false,
      muscles: {
        primary: [],
        secondary: [],
      },
      id: exercise.externalId ?? null,
    }));
    const response = await openApiRequest(putExercises, {
      body: {
        items: rows,
      },
    });
    if (response.error) {
      this.logger.error(null, response.error);
      throw new Error('Error during uploading');
    }
    const upsertedEntities = response.data.items;
    for (const [i, exercise] of exercises.entries()) {
      if (!upsertedEntities[i]) {
        throw new Error('Matching upserted entity not found');
      }
      exercise.externalId = upsertedEntities[i].id;
      exercise.lastPushedAt = new Date();
    }
    await db.insert(schema.exercises).values(exercises).onConflictDoUpdate(
      {
        target: schema.exercises.id,
        set: conflictUpdateSetAllColumns(schema.exercises),
      }
    );
    return true;
  }

  async pullFromServer(db: AsyncDrizzleDb, _userId: number, progress: StageProgressCallback): Promise<boolean> {
    console.log('Pull');
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);

    let page = 1;
    let processedItems = 0;
    const res = await transactionAsync(db, async (trx) => {
    // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await getExercises({
          query: {
            updatedAfter: lastUpdateFromServer ?? undefined,
            includeBuiltIn: true,
            includeDeleted: true,
            page: page++,
          },
        });
        if (response.error) {
          return false;
        }
        progress({itemsDone: processedItems, itemsNumber: response.data.info.count});
        processedItems += response.data.items.length;
        for (const exercise of response.data.items) {
          const row: NewModel<AppExercise> = {
            params: exercise.params,
            name: exercise.name,
            description: exercise.description,
            difficulty: exercise.difficulty,
            equipment: exercise.equipment,
            images: exercise.images,
            userId: exercise.userId,
            copiedFromId: exercise.copiedFromId,
            parentExerciseId: exercise.parentExerciseId,
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            deletedAt: exercise.deletedAt,
            externalId: exercise.id,
            lastPulledAt: new Date(),
            lastPushedAt: new Date(),
          };
          const inserted = await db.insert(schema.exercises).values(row).onConflictDoUpdate({
            target: schema.exercises.externalId,
            set: conflictUpdateSetAllColumns(schema.exercises),
          }).returning();
          if (!inserted[0]) {
            throw new Error("Couldn't get inserted data");
          }
          await db.delete(schema.exerciseMuscle).where(
            eq(schema.exerciseMuscle.exerciseId, inserted[0].id)
          );
          const muscleRows: NewModel<AppExerciseMuscle>[] = [];
          for (const muscle of exercise.muscles.primary) {
            muscleRows.push({
              exerciseId: inserted[0].id,
              isPrimary: true,
              muscle: muscle,
            });
          }
          for (const muscle of exercise.muscles.secondary) {
            muscleRows.push({
              exerciseId: inserted[0].id,
              isPrimary: false,
              muscle: muscle,
            });
          }
          if (muscleRows.length === 0) {
            continue;
          }
          await db.insert(schema.exerciseMuscle).values(muscleRows);
        }

        if (response.data.items.length === 0 && response.data.items.length < response.data.info.pageSize) {
          break;
        }
      }
      return true;
    });
    return res;
  }
  protected async getLatestPullSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.exercises.findFirst({
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
    const row = await db.query.exercises.findFirst({
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
}
