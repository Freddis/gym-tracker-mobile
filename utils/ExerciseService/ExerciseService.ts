import {AppExercise} from '@/types/models/AppExercise';
import {NestedAppExercise} from './types/NestedAppExercise';
import {ExerciseUpsertDto, getExercises, putExercises} from '@/openapi-client';
import {openApiRequest} from '../openApiRequest';
import {schema} from '@/db/schema';
import {NewModel} from '@/types/NewModel';
import {AsyncDrizzleDb, conflictUpdateSetAllColumns, db, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {transactionAsync} from '../runTransaction';


export class ExerciseService {

  async getPersonalLibrary(params: {presonal?: boolean, search?: string;}): Promise<NestedAppExercise[]> {
    const items = await db.query.exercises.findMany({
      where: (t, op) => op.and(
        params.presonal ? op.not(op.isNull(t.userId)) : op.isNull(t.userId),
        params.search ? op.like(t.name, `%${params.search ?? ''}%`) : undefined,
        op.isNull(t.deletedAt)
      ),
    });
    console.log(params);
    let result = items;
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
    return result;
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

  async pullFromServer(db: AsyncDrizzleDb): Promise<boolean> {
    console.log('Pull');
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);

    let page = 1;
    const res = await transactionAsync(db, async (trx) => {
    // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await getExercises({
          query: {
            updatedAfter: lastUpdateFromServer ?? undefined,
            includeBuiltIn: true,
            page: page++,
          },
        });
        if (response.error) {
          return false;
        }
        const newRows: NewModel<AppExercise>[] = [];
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
          newRows.push(row);
        }
        if (newRows.length === 0) {
          break;
        }
        await db.insert(schema.exercises).values(newRows).onConflictDoUpdate({
          target: schema.exercises.externalId,
          set: conflictUpdateSetAllColumns(schema.exercises),
        });

        if (response.data.items.length < response.data.info.pageSize) {
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
