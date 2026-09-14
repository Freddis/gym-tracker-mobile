import {ExerciseRow} from '@/types/models/ExerciseRow';
import {NestedAppExercise} from './types/NestedAppExercise';
import {Exercise, ExerciseUpsertDto, getExercises, Image, ImageType, ImageUpsertDto, Muscle, putExercises} from '@/openapi-client';
import {openApiRequest} from '../openApiRequest';
import {schema} from '@/db/schema';
import {NewModel} from '@/types/NewModel';
import {asyncDrizzle, AsyncDrizzleDb, conflictUpdateSetAllColumns, db, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {transactionAsync} from '../runTransaction';
import {AppExerciseMuscle} from '../../types/models/AppExerciseMuscle';
import {eq, inArray} from 'drizzle-orm';
import {StageProgressCallback} from '../SyncService/types/StageProgressCallback';
import {ISyncedEntityService} from '../SyncService/types/ISyncedEntityService';
import uuid from 'react-native-uuid';
import {ImageService} from '../ImageService/ImageService';

export class ExerciseService implements ISyncedEntityService {
  protected logger: Logger = new Logger(ExerciseService.name);
  protected db: DrizzleDb;


  constructor(db: DrizzleDb, private readonly imageService: ImageService) {
    this.db = db;
  }

  async copyExercise(userId: number, exerciseId: string, trx: DrizzleDb): Promise<Exercise> {
    const exercise = await this.getExercise(exerciseId);
    if (!exercise) {
      throw new Error(`Exercise not found ${exerciseId}`);
    }
    const newExercise: Exercise = {
      ...exercise,
      id: uuid.v4(),
      userId: userId,
      copiedFromId: exerciseId,
      parentExerciseId: null,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    return await this.createExercise(newExercise, undefined, trx);
  }

  async createExercise(exercise: Exercise, image?: string | null, trx?: DrizzleDb) {
    return this.updateExercise(exercise, image, trx);
  }

  async updateExercise(exercise: Exercise, image?: string | null, trx?: DrizzleDb) {
    trx = trx ?? this.db;
    const userId = exercise.userId;
    if (userId === null) {
      throw new Error('Local user id is required to store exercise images');
    }
    if (image) {
      const appImage = await this.imageService.createImage(userId, image, ImageType.EXERCISE, trx);
      exercise = {
        ...exercise,
        images: [{id: appImage.id, url: appImage.url ?? ''}],
      };
    } else if (image === null) {
      exercise = {
        ...exercise,
        images: [],
      };
    }
    const result = await this.upsertExercise(trx, exercise, null, userId);
    return result;
  }

  async deleteExercise(id: string) {
    await this.db.update(schema.exercises).set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(schema.exercises.id, id));
  }

  async getExercise(exerciseId: string, db: DrizzleDb = this.db): Promise<Exercise> {
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
    const imageMap = await this.loadImageMap([row], db);
    const result: Exercise = {
      ...row,
      images: imageMap.get(exerciseId) ?? [],
      isArchived: false,
      muscles: {
        primary: muscleRows.filter((x) => x.isPrimary).map((x) => x.muscle),
        secondary: muscleRows.filter((x) => !x.isPrimary).map((x) => x.muscle),
      },
      variations: [],
    };
    return result;
  }

  async getPersonalLibrary(params: {presonal?: boolean, search?: string;}): Promise<NestedAppExercise[]> {
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
    let result: (ExerciseRow & {variations?: ExerciseRow[]})[] = items;
    if (!params.presonal) {
      result = [];
      const map = items.reduce(
        (acc, item) => item.id ? acc.set(item.id, item) : acc,
        new Map<string, ExerciseRow & {variations?: ExerciseRow[]}>()
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
    const flatExercises = result.flatMap((x) => [x, ...(x.variations ?? [])]);
    const muscles = await db.query.exerciseMuscle.findMany({
      where: (t, op) => op.inArray(t.exerciseId, flatExercises.map((x) => x.id)),
    });

    const primaryMuscles = new Map<string, Muscle[]>();
    const secondaryMuscles = new Map<string, Muscle[]>();
    const imageMap = await this.loadImageMap(flatExercises);
    for (const muscleRow of muscles) {

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

    const nested: NestedAppExercise[] = [];
    for (const row of result) {
      const exercise: NestedAppExercise = {
        ...row,
        images: imageMap.get(row.id) ?? [],
        isArchived: false,
        muscles: {
          primary: primaryMuscles.get(row.id) ?? [],
          secondary: secondaryMuscles.get(row.id) ?? [],
        },
        variations: (row.variations ?? []).map((x) => ({
          ...x,
          images: imageMap.get(x.id) ?? [],
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

  async wipeLocalData(userId: number, db: DrizzleDb): Promise<boolean> {
    try {
      await db.delete(schema.exercises);
    } catch (e: unknown) {
      this.logger.error('Error during wiping local data', e);
      return false;
    }
    return true;
  }
  async pushToServer(userId: number, db: DrizzleDb = this.db): Promise<boolean> {
    this.logger.info('Pushing exercises to server', {userId});
    const lastUpdate = await this.getLatestPushSyncDate(db);
    this.logger.info('Last sync date', {lastUpdate});
    const exercises = await db.query.exercises.findMany({
      with: {
        muscles: true,
      },
      where: (t, op) => op.and(
        op.eq(t.userId, userId),
        lastUpdate ? op.or(
          op.gt(t.updatedAt, t.lastPushedAt),
          op.gt(t.createdAt, t.lastPushedAt),
          op.gt(t.deletedAt, t.lastPushedAt),
          op.isNull(t.lastPushedAt),
        ) : undefined
      ),
    });
    if (exercises.length === 0) {
      return true;
    }
    const imageIds = Array.from(new Set(exercises.flatMap((x) => x.images)));
    const imageMap = await this.imageService.loadMap(imageIds, db);
    const rows: ExerciseUpsertDto[] = exercises.map((exercise) => ({
      ...exercise,
      images: exercise.images.map((imageId) => {
        const image = imageMap.get(imageId);
        if (!image) {
          return null;
        }
        const dto: ImageUpsertDto = this.imageService.toImageUpsertDto(image);
        return dto;
      }).filter((x) => x !== null),
      isArchived: false,
      muscles: {
        primary: exercise.muscles.filter((x) => x.isPrimary).map((x) => x.muscle),
        secondary: exercise.muscles.filter((x) => !x.isPrimary).map((x) => x.muscle),
      },
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
      const upserted = upsertedEntities[i];
      if (!upserted) {
        throw new Error('Matching upserted entity not found');
      }
      // exercise.externalId = upsertedEntities[i].id;
      exercise.lastPushedAt = new Date();
      await this.imageService.upsertImages(userId, db, upserted.images, ImageType.EXERCISE);
      const staleImageIds = exercise.images.filter((id) => !upserted.images.some((x) => x.id === id));
      exercise.images = upserted.images.map((x) => x.id);
      if (staleImageIds.length > 0) {
        await db.delete(schema.images).where(inArray(schema.images.id, staleImageIds));
      }
    }
    await db.insert(schema.exercises).values(exercises).onConflictDoUpdate(
      {
        target: schema.exercises.id,
        set: conflictUpdateSetAllColumns(schema.exercises),
      }
    );
    return true;
  }

  async pullFromServer(userId: number, db?: AsyncDrizzleDb, progress: StageProgressCallback = () => {}): Promise<boolean> {
    const database = db ?? await asyncDrizzle();
    const lastUpdateFromServer = await this.getLatestPullSyncDate(database);

    let page = 1;
    let processedItems = 0;
    const res = await transactionAsync(database, async (trx) => {

      while (true) {
        const response = await getExercises({
          query: {
            updatedAfter: lastUpdateFromServer ?? undefined,
            includeBuiltIn: true,
            includeDeleted: true,
            page: page++,
          },
          timeout: 10000,
        });
        if (response.error) {
          return false;
        }
        progress({itemsDone: processedItems, itemsNumber: response.data.info.count});
        processedItems += response.data.items.length;
        for (const exercise of response.data.items) {
          await this.upsertExercise(trx, exercise, new Date(), userId);
        }

        if (response.data.items.length < response.data.info.pageSize) {
          break;
        }
      }
      return true;
    });
    return res;
  }

  protected async upsertExercise(db: DrizzleDb, exercise: Exercise, lastSync: Date | null, userId: number): Promise<Exercise> {
    // local writes have to keep the sync stamps, clearing them drags the pull window back to the oldest row in the table
    const existing = lastSync ? null : await db.query.exercises.findFirst({
      columns: {
        lastPulledAt: true,
        lastPushedAt: true,
      },
      where: (t, op) => op.eq(t.id, exercise.id),
    });
    const row: ExerciseRow = {
      id: exercise.id,
      params: exercise.params,
      name: exercise.name,
      description: exercise.description,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      images: exercise.images.map((image) => image.id),
      userId: exercise.userId,
      copiedFromId: exercise.copiedFromId,
      parentExerciseId: exercise.parentExerciseId,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      deletedAt: exercise.deletedAt,
      lastPulledAt: lastSync ?? existing?.lastPulledAt ?? null,
      lastPushedAt: lastSync ?? existing?.lastPushedAt ?? null,
    };
    const inserted = await db.insert(schema.exercises).values(row).onConflictDoUpdate({
      target: schema.exercises.id,
      set: conflictUpdateSetAllColumns(schema.exercises),
    }).returning();
    const insertedRow = inserted[0];
    if (!insertedRow) {
      throw new Error("Couldn't get inserted data");
    }
    // images without a url are local rows holding base64 data, upserting them would wipe it
    await this.imageService.upsertImages(userId, db, exercise.images.filter((x) => x.url), ImageType.EXERCISE);
    await db.delete(schema.exerciseMuscle).where(
      eq(schema.exerciseMuscle.exerciseId, insertedRow.id)
    );
    const muscleRows: NewModel<AppExerciseMuscle>[] = [];
    for (const muscle of exercise.muscles.primary) {
      muscleRows.push({
        exerciseId: insertedRow.id,
        isPrimary: true,
        muscle: muscle,
      });
    }
    for (const muscle of exercise.muscles.secondary) {
      muscleRows.push({
        exerciseId: insertedRow.id,
        isPrimary: false,
        muscle: muscle,
      });
    }
    if (muscleRows.length === 0) {
      return exercise;
    }
    await db.insert(schema.exerciseMuscle).values(muscleRows);
    return exercise;
  }

  private async loadImageMap(exercises: ExerciseRow[], db: DrizzleDb = this.db): Promise<Map<string, Image[]>> {
    const result = new Map<string, Image[]>();
    const imageIds = Array.from(new Set(exercises.flatMap((x) => x.images)));
    if (imageIds.length === 0) {
      return result;
    }
    const imageMap = await this.imageService.loadMap(imageIds, db);
    for (const exercise of exercises) {
      const images = exercise.images.map((imageId) => {
        const image = imageMap.get(imageId);
        if (!image) {
          return null;
        }
        return {
          id: image.id,
          url: this.imageService.getImageUrl(image) ?? '',
        };
      }).filter((x) => x !== null);
      result.set(exercise.id, images);
    }
    return result;
  }

  protected async getLatestPullSyncDate(db: DrizzleDb): Promise<Date | null> {
    return await this.getLatestPushSyncDate(db);
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
