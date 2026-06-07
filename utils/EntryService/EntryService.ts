import {schema} from '../../db/schema';
import {
  Entry,
  EntryType,
  EntryUpsertDto,
  EntryVisibility,
  Image,
  ExternalSource,
  ImageType,
  ImageUpsertDto,
  PostEntryUpsertDto,
} from '../../openapi-client';
import {AppEntry, BaseEntry, PostAppEntry, WeightAppEntry, WorkoutAppEntry} from '../../types/models/AppEntry';
import {AppWorkout, CompleteAppWorkout} from '../../types/models/AppWorkout';
import {NewModel} from '../../types/NewModel';
import {ApiService} from '../ApiService/ApiService';
import {asyncDrizzle, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {WeightService} from '../WeightService/WeightService';
import {WorkoutService} from '../WorkoutService/WorkoutService';
import {eq} from 'drizzle-orm';
import {ImageService} from '../ImageService/ImageService';
import {OutdoorRunService} from '../OutdoorRunService/OutdoorRunService';
import {OutdoorWalkService} from '../OutdoorWalkService/OutdoorWalkService';
import {WorkoutProxyTyped, QuantitySampleTyped, WorkoutActivityType} from '@kingstinct/react-native-healthkit';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';
import {AppOutdoorWalk} from '../../types/models/AppOutdoorWalk';
import {AppOutdoorRun} from '../../types/models/AppOutdoorRun';
import {StageProgressCallback} from '../SyncService/types/StageProgressCallback';
import {AppImage} from '../../types/models/AppImage';
import uuid from 'react-native-uuid';
import {EntryAppObjectMap, EntryObjectMap, IEntryService} from '../../types/IEntryService';
import {avoidLet} from '../avoidLet';
import {ISyncedEntityService} from '../SyncService/types/ISyncedEntityService';
import {EntryObjectArrayMap} from './types/EntryObjectArrayMap';
import {EntryServiceMap} from './types/EntryServiceMap';
import {NumericEntryKeys} from './types/NumericEntryKeys';
import {transactionAsync} from '../runTransaction';
import {EntryObjectMapMap} from './types/EntryObjectMapMap';
import {MealService} from '../MealService/MealService';
import {CalorieGoalService} from '../CalorieGoalService/CalorieGoalService';
import {AppMeal} from '../MealService/types/AppMeal';

export class EntryService implements ISyncedEntityService {
  protected logger: Logger = new Logger(EntryService.name);
  protected entryServices: EntryServiceMap;

  constructor(
    private readonly api: ApiService,
    private readonly weightService: WeightService,
    private readonly workoutService: WorkoutService,
    private readonly imageService: ImageService,
    private readonly outdoorRunService: OutdoorRunService,
    private readonly outdoorWalkService: OutdoorWalkService,
    mealService: MealService,
    calorieGoalService: CalorieGoalService,
    private readonly db: DrizzleDb,
  ) {
    this.logger = new Logger(EntryService.name);
    this.entryServices = {
      [EntryType.WORKOUT]: {
        key: 'workoutId',
        service: workoutService,
      },
      [EntryType.WEIGHT]: {
        key: 'weightId',
        service: weightService,
      },
      [EntryType.OUTDOOR_RUN]: {
        key: 'outdoorRunId',
        service: outdoorRunService,
      },
      [EntryType.OUTDOOR_WALK]: {
        key: 'outdoorWalkId',
        service: outdoorWalkService,
      },
      [EntryType.MEAL]: {
        key: 'mealId',
        service: mealService,
      },
      [EntryType.CALORIE_GOAL]: {
        key: 'calorieGoalId',
        service: calorieGoalService,
      },
    };
  }

  async pullFromServer(_userId: number, db: DrizzleDb, progress: StageProgressCallback): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);
    let page = 1;
    let processedItems = 0;
    const types: EntryType[] = Object.values(EntryType);

    while (true) {
      const response = await this.api.client().getEntriesOwn({
        query: {
          updatedAfter: lastUpdateFromServer ?? undefined,
          includeDeleted: true,
          page: page++,
          type: types,
        },
      });
      if (response.error) {
        return false;
      }
      progress({itemsDone: processedItems, itemsNumber: response.data.info.count});
      processedItems += response.data.items.length;
      await this.processPulledItems(db, response.data.items);
      if (response.data.items.length < response.data.info.pageSize) {
        return true;
      }
    }
  }

  protected async processPulledItems(db: DrizzleDb, items: Entry[]): Promise<void> {
    const firstItem = items[0];
    if (!firstItem) {
      return;
    }

    // removing items that don't need to be updated
    // this relevant because we pull by last pull date, while update on the server is set by last pushed date
    // meaning we will receive that we pushed on the next pull
    // todo: this is half measure - resolve this algorith once and for all
    const existing = await db.query.entries.findMany({
      where: (t, op) => op.inArray(t.id, items.map((x) => x.id)),
    });
    const existingMap = new Map<string, typeof schema.entries.$inferSelect>(existing.map((x) => [x.id, x]));
    const itemsToUpdate = items.filter((x) => {
      const existing = existingMap.get(x.id);
      if (!existing) {
        return true;
      }
      const lastUpdateStampOwn = Math.max(existing.createdAt.getTime(), existing.updatedAt?.getTime() ?? 0, existing.deletedAt?.getTime() ?? 0);
      const lastUpdateStampServer = Math.max(x.createdAt.getTime(), x.updatedAt?.getTime() ?? 0, x.deletedAt?.getTime() ?? 0);
      return lastUpdateStampOwn < lastUpdateStampServer;
    });

    const images: [string, Image][] = [];
    /**
     * Typescript helper
     */
    function pushMappedEntry<T extends Exclude<EntryType, EntryType.POST>>(
      map: EntryObjectArrayMap,
      type: T,
      id: string,
      object: EntryObjectMap[T],
    ) {
      map[type].push([id, object]);
    }
    const map: EntryObjectArrayMap = {
      [EntryType.WORKOUT]: [],
      [EntryType.WEIGHT]: [],
      [EntryType.OUTDOOR_RUN]: [],
      [EntryType.OUTDOOR_WALK]: [],
      [EntryType.POST]: [],
      [EntryType.MEAL]: [],
      [EntryType.CALORIE_GOAL]: [],
    };
    for (const item of itemsToUpdate) {
      if (item.image) {
        images.push([item.id, item.image]);
      }
      if (item.type === EntryType.POST) {
        continue;
      }
      const object: EntryObjectMap[typeof item.type] | null = this.entryServices[item.type].service.getObject(item);
      if (object) {
        pushMappedEntry(map, item.type, item.id, object);
        continue;
      }
    }
    const imageMap = await this.imageService.processPulledItems(firstItem.user.id, db, images, ImageType.ENTRY);
    const objectMapMap: Record<Exclude<EntryType, EntryType.POST>, {key: NumericEntryKeys, map: Map<string, number>}
    > = {
      [EntryType.WORKOUT]: {
        key: 'workoutId',
        map: await this.entryServices[EntryType.WORKOUT].service.processPulledItems(db, map[EntryType.WORKOUT]),
      },
      [EntryType.WEIGHT]: {
        key: 'weightId',
        map: await this.entryServices[EntryType.WEIGHT].service.processPulledItems(db, map[EntryType.WEIGHT]),
      },
      [EntryType.OUTDOOR_RUN]: {
        key: 'outdoorRunId',
        map: await this.entryServices[EntryType.OUTDOOR_RUN].service.processPulledItems(db, map[EntryType.OUTDOOR_RUN]),
      },
      [EntryType.OUTDOOR_WALK]: {
        key: 'outdoorWalkId',
        map: await this.entryServices[EntryType.OUTDOOR_WALK].service.processPulledItems(db, map[EntryType.OUTDOOR_WALK]),
      },
      [EntryType.MEAL]: {
        key: 'mealId',
        map: await this.entryServices[EntryType.MEAL].service.processPulledItems(db, map[EntryType.MEAL]),
      },
      [EntryType.CALORIE_GOAL]: {
        key: 'calorieGoalId',
        map: await this.entryServices[EntryType.CALORIE_GOAL].service.processPulledItems(db, map[EntryType.CALORIE_GOAL]),
      },
    };
    for (const x of itemsToUpdate) {
      const imageId = imageMap.get(x.id);
      const entry: typeof schema.entries.$inferInsert = {
        id: x.id,
        userId: x.user.id,
        type: x.type,
        imageId: imageId,
        title: x.title,
        note: x.note,
        visibility: x.visibility,
        externalId: x.externalId,
        lastPulledAt: new Date(),
        lastPushedAt: new Date(),
        time: x.time,
        createdAt: x.createdAt,
        deletedAt: x.deletedAt,
        updatedAt: x.updatedAt,
        healthkitId: x.healthkitId,
        healthkitAnchor: x.healthkitAnchor,
        healthkitAnchors_3_0: x.healthkitAnchors_3_0,
        healthkitSource: x.healthkitSource,
        healthkitSourceName: x.healthkitSourceName,
        healthkitDevice: x.healthkitDevice,
        healthkitDeviceName: x.healthkitDeviceName,
        externalSource: x.externalSource,
      };
      if (x.type !== EntryType.POST) {
        const objectMap = objectMapMap[x.type];
        const objectId = objectMap.map.get(x.id);
        if (!objectId) {
          throw new Error(`Object id not found for entry ${x.type}:${x.id}`);
        }
        entry[objectMap.key] = objectId;
      }

      //todo: we can optimize it a little bit more by inserting and updating in bulk
      const existing = existingMap.get(x.id);
      if (!existing) {
        await db.insert(schema.entries).values(entry);
        continue;
      }
      await db.update(schema.entries).set(entry).where(eq(schema.entries.id, existing.id));
    }
  }

  async deleteEntryObjectsFromDb(entry: AppEntry, trx: DrizzleDb): Promise<void> {
    await trx.delete(schema.entries).where(eq(schema.entries.id, entry.id));
    if (entry.type === EntryType.POST) {
      return;
    }
    const service: IEntryService<typeof entry.type> = this.entryServices[entry.type].service;
    const objectKey = this.entryServices[entry.type].key;
    const objectId = entry[objectKey];
    if (objectId) {
      await service.deleteById(objectId, trx);
    }
  }

  async deleteEntry(entryId: string) {
    await this.db.update(schema.entries).set({
      deletedAt: new Date(),
    }).where(
      eq(schema.entries.id, entryId)
    );
  }

  async wipeLocalData(userId: number, db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.entries);
    await this.entryServices.Meal.service.wipeLocalData(db);
    await this.entryServices.CalorieGoal.service.wipeLocalData(db);
    await this.weightService.wipeLocalData(db);
    await this.workoutService.wipeLocalData(db);
    await this.outdoorRunService.wipeLocalData(db);
    await this.outdoorWalkService.wipeLocalData(db);
    await this.imageService.wipeLocalData(db);
    return true;
  }

  async pushEntry(entry: AppEntry): Promise<boolean> {
    return await this.pushEntries(this.db, [entry.id]);
  }

  protected createUpsertDto(entry: AppEntry): EntryUpsertDto {
    const image: ImageUpsertDto | undefined | null = avoidLet(() => {
      if (!entry.image) {
        return null;
      }
      if (!entry.image.image) {
        return undefined;
      }
      return {
        data: entry.image.image,
      };
    });

    const postDto: PostEntryUpsertDto = {
      id: entry.id,
      visibility: entry.visibility,
      time: entry.time,
      createdAt: entry.createdAt,
      deletedAt: entry.deletedAt,
      type: 'Post',
      image: image,
      updatedAt: entry.updatedAt,
      title: entry.title,
      note: entry.note,
      externalId: entry.externalId,
      externalSource: entry.externalSource,
      healthkitId: entry.healthkitId,
      healthkitAnchor: entry.healthkitAnchor,
      healthkitAnchors_3_0: entry.healthkitAnchors_3_0,
      healthkitSource: entry.healthkitSource,
      healthkitSourceName: entry.healthkitSourceName,
      healthkitDevice: entry.healthkitDevice,
      healthkitDeviceName: entry.healthkitDeviceName,
    };
    if (entry.type === EntryType.POST) {
      return postDto;
    }
    const service: IEntryService<typeof entry.type> = this.entryServices[entry.type].service;
    const dto = service.getUpsertDto(entry, postDto);
    return dto;
  }

  async saveEntry<T extends AppEntry>(entry: T, image?: string | null): Promise<T> {
    const db = await asyncDrizzle();
    return await transactionAsync(db, async (db) => {
      if (image !== undefined) {
        await this.updateEntryImage(db, entry, image);
      }
      if (entry.type !== EntryType.POST) {
        const service: IEntryService<typeof entry.type> = this.entryServices[entry.type].service;
        await service.update(entry, db);
      }
      entry.updatedAt = new Date();
      await db.update(schema.entries).set({
        note: entry.note,
        imageId: entry.imageId,
        title: entry.title,
        visibility: entry.visibility,
        time: entry.time,
        updatedAt: entry.updatedAt,
      }).where(
      eq(schema.entries.id, entry.id)
      );
      return {
        ...entry,
      };
    });
  }

  protected async updateEntryImage(db: DrizzleDb, entry: AppEntry, image: string | null) {
    if (entry.image && image === null) {
      await db.update(schema.entries).set({
        imageId: null,
      }).where(
        eq(schema.entries.id, entry.id)
      );
      await db.delete(schema.images).where(
        eq(schema.images.id, entry.image.id)
      );
      entry.image = null;
      entry.imageId = null;
      return;
    }

    if (entry.image) {
      await db.update(schema.images).set({
        image: image,
      }).where(
        eq(schema.images.id, entry.image.id)
      );
      entry.image.image = image;
      return;
    }

    const newImage: typeof schema.images.$inferInsert = {
      userId: entry.userId,
      image: image,
      type: ImageType.ENTRY,
    };
    const imageRows = await db.insert(schema.images).values(newImage).returning();
    const imageRow = imageRows[0];
    if (!imageRow) {
      throw new Error('Failed to insert image');
    }
    entry.imageId = imageRow.id;
    entry.image = {
      id: imageRow.id,
      type: ImageType.ENTRY,
      image: image,
      userId: entry.userId,
      // externalId: null,
      // lastPulledAt: null,
      // lastPushedAt: null,
      url: null,
    };
  }

  async getEntries<T extends EntryType>(
    db: DrizzleDb,
    params?: {
      externalIds?: string[],
      healthkitIds?: string[],
      ids?: string[],
      limit?: number,
      updatedAt?: Date,
      includeDeleted?: boolean,
      types?: T[],
      date?: Date,
      page?: number,
    }
  ): Promise<(AppEntry & {type: T})[]> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;
    const sqlQuery = db.query.entries.findMany({
      where: (t, op) => op.and(
        params?.ids ? op.inArray(t.id, params.ids) : undefined,
        params?.externalIds ? op.inArray(t.externalId, params.externalIds) : undefined,
        params?.healthkitIds ? op.inArray(t.healthkitId, params.healthkitIds) : undefined,
        params?.includeDeleted ? undefined : op.isNull(t.deletedAt),
        params?.types ? op.inArray(t.type, params.types) : undefined,
        params?.date ? op.gte(t.time, params.date) : undefined,
      ),
      orderBy: (t, op) => op.desc(t.time),
      limit: params?.limit,
      offset: offset,
    });

    const entries = await sqlQuery;

    const createMap = async <T extends Exclude<EntryType, EntryType.POST>>(
      type: T,
      rows: typeof schema.entries.$inferSelect[]
    ): Promise<Map<number, EntryAppObjectMap[T]>> => {
      if (rows.length === 0) {
        return new Map();
      }
      const entryService = this.entryServices[type];
      const key = entryService.key;
      if (!key) {
        return new Map();
      }
      // todo: if migrations are not done, drizzle puts the key name into field that doesn't exist in db
      // let's we added key mealId, then ids= ['mealId','mealId','mealId',...] that's not gonna work properly
      const ids = rows.map((x) => x[key]).filter((x) => x !== null);
      if (ids.length === 0) {
        return new Map();
      }
      return await entryService.service.loadMap(ids);
    };

    const objectMapMap: EntryObjectMapMap = {
      [EntryType.WORKOUT]: await createMap(EntryType.WORKOUT, entries),
      [EntryType.WEIGHT]: await createMap(EntryType.WEIGHT, entries),
      [EntryType.OUTDOOR_RUN]: await createMap(EntryType.OUTDOOR_RUN, entries),
      [EntryType.OUTDOOR_WALK]: await createMap(EntryType.OUTDOOR_WALK, entries),
      [EntryType.POST]: new Map(),
      [EntryType.MEAL]: await createMap(EntryType.MEAL, entries),
      [EntryType.CALORIE_GOAL]: await createMap(EntryType.CALORIE_GOAL, entries),
    };
    const imageIds: number[] = entries.map((x) => x.imageId).filter((x) => x !== null);
    const imageMap = imageIds.length > 0 ? await this.imageService.loadMap(imageIds) : new Map();
    // const result: AppEntry[] = [];
    const result: AppEntry[] = entries.map((item) => {
      const image = imageMap.get(item.imageId ?? 0);
      const base: BaseEntry = {
        ...item,
        image: image ?? null,
      };

      if (item.type === EntryType.POST) {
        return {
          ...base,
          type: EntryType.POST,
        };
      }
      const {key} = this.entryServices[item.type];
      const entryService: IEntryService<typeof item.type> = this.entryServices[item.type].service;
      const id = item[key];
      if (!id) {
        throw new Error(`Object id not found for entry ${item.type}:${item.id}`);
      }
      const data: EntryAppObjectMap[typeof item.type] | undefined = objectMapMap[item.type].get(id);
      if (!data) {
        throw new Error(`Object data not found for entry ${item.id}`);
      }
      const object: AppEntry = entryService.construct(base, data);
      return object;

    });
    return result as (AppEntry & {type: T})[];
  }

  async getEntry<T extends EntryType>(id: string, type?: EntryType): Promise<AppEntry & {type: T}> {
    const entries = await this.getEntries(this.db, {ids: [id], types: type ? [type] : undefined});
    if (!entries[0]) {
      throw new Error('Entry not found');
    }
    return entries[0] as AppEntry & {type: T};
  }

  async getEntryByExternalId(externalId: string): Promise<AppEntry | null> {
    const entries = await this.getEntries(this.db, {externalIds: [externalId]});
    return entries[0] ?? null;
  }
  async getEntryByHealthkitId(healthkitId: string): Promise<AppEntry | null> {
    const entries = await this.getEntries(this.db, {healthkitIds: [healthkitId]});
    return entries[0] ?? null;
  }

  async pushToServer(userId: number, db: DrizzleDb, progress: StageProgressCallback): Promise<boolean> {
    this.logger.info('Pushing entries to server', {userId});
    const syncDate = await this.getLatestPushSyncDate(db);
    this.logger.info('Last sync date', {syncDate});
    const limit = 20;
    const idRows = await db.query.entries.findMany({
      columns: {
        id: true,
      },
      where: (t, op) => op.and(
      eq(t.userId, userId),
      syncDate ? op.or(
        op.gt(t.updatedAt, t.lastPushedAt),
        op.gt(t.createdAt, t.lastPushedAt),
        op.gt(t.deletedAt, t.lastPushedAt),
        op.isNull(t.lastPushedAt),
      ) : undefined
    ),
    });
    const ids: string[] = idRows.map((x) => x.id);
    const itemsNumber = ids.length;
    progress({itemsDone: 0, itemsNumber});
    this.logger.info(`Found ${ids.length} entries`);
    while (ids.length > 0) {
      const result = await this.pushEntries(db, ids.slice(0, limit));
      if (!result) {
        return false;
      }
      ids.splice(0, limit);
      const itemsDone = itemsNumber - ids.length;
      progress({itemsDone, itemsNumber});
    }
    this.logger.info('Done');
    return true;
  }

  protected async pushEntries(db: DrizzleDb, ids: string[]): Promise<boolean> {
    this.logger.info('Getting entries to upsert', {ids: ids});
    const entriesToUpsert: AppEntry[] = await this.getEntries(db, {
      ids: ids,
      includeDeleted: true,
    });
    const data: EntryUpsertDto[] = entriesToUpsert.map((x) => this.createUpsertDto(x));
    console.log('Sending entries to server', data);
    const response = await this.api.client().putEntries({
      body: {
        items: data,
      },
    });

    if (response.error) {
      return false;
    }
    for (const [i, entry] of response.data.items.entries()) {
      if (!entriesToUpsert[i]) {
        throw new Error('Matching upserted entity not found');
      }
      await db.update(schema.entries).set({
        lastPushedAt: new Date(),
        // remoteId: entry.id,
      }).where(
        eq(schema.entries.id, entriesToUpsert[i].id)
      );
      // update image url if it was changed
      if (entriesToUpsert[i].imageId && entry.image) {
        await db.update(schema.images).set({
          url: entry.image.url,
          image: null,
        }).where(
          eq(schema.images.id, entriesToUpsert[i].imageId)
        );
      }
    }
    return true;
  }

  protected async getLatestPushSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.entries.findFirst({
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

  protected async getLatestPullSyncDate(db: DrizzleDb): Promise<Date | null> {
    return await this.getLatestPushSyncDate(db);
  }

  async importFromHealthKit(
    user: AuthUser,
    workout: WorkoutProxyTyped,
    hr: readonly QuantitySampleTyped<'HKQuantityTypeIdentifierHeartRate'>[]
  ): Promise<void> {
    const existing: AppEntry | null = await this.getEntryByHealthkitId(workout.uuid);
    const skipOnexisting = true;
    if (existing && skipOnexisting) {
      return;
    }
    const db = await asyncDrizzle();
    await transactionAsync(db, async (trx) => {
      this.logger.info('Getting existing entry by external id', {externalId: workout.uuid});
      let createdAt: Date = existing?.createdAt ?? new Date();
      let updatedAt: Date | null = existing ? new Date() : null;
      // let remoteId = existing?.remoteId ?? null;
      if (existing) {
        this.logger.info('Deleting existing entry', {id: existing.id});
        await this.deleteEntryObjectsFromDb(existing, trx);
      }
      const typeMap: Partial<Record<WorkoutActivityType, EntryType>> = {
        [WorkoutActivityType.walking]: EntryType.OUTDOOR_WALK,
        [WorkoutActivityType.running]: EntryType.OUTDOOR_RUN,
      };
      const type = typeMap[workout.workoutActivityType];
      if (!type) {
        throw new Error('Unknown workout activity type');
      }
      this.logger.info('Importing workout', {externalId: workout.uuid, type});
      let walk: AppOutdoorWalk | null = null;
      let run: AppOutdoorRun | null = null;
      let time: Date = createdAt;
      const routes = (await workout.getWorkoutRoutes()).map((route) => route.locations).flat();
      if (type === EntryType.OUTDOOR_WALK) {
        walk = await this.outdoorWalkService.import(user, workout, routes, hr, trx);
        time = walk.start;
      }
      if (type === EntryType.OUTDOOR_RUN) {
        run = await this.outdoorRunService.import(user, workout, routes, hr, trx);
        time = run.start;
      }
      // For some reason name in non JSON version is SourceProxy. Weird.
      const sourceRev = workout.sourceRevision.source.toJSON();
      const entry: typeof schema.entries.$inferInsert = {
        id: existing?.id ?? uuid.v4(),
        userId: user.id,
        type: type,
        time: time,
        createdAt: createdAt,
        updatedAt: updatedAt,
        visibility: EntryVisibility.PUBLIC,
        // remoteId: remoteId,
        lastPulledAt: existing?.lastPulledAt ?? null,
        lastPushedAt: existing?.lastPushedAt ?? null,
        workoutId: null,
        weightId: null,
        outdoorRunId: run?.id ?? null,
        outdoorWalkId: walk?.id ?? null,
        imageId: null,
        title: null,
        note: null,
        healthkitId: workout.uuid,
        healthkitAnchor: null,
        healthkitAnchors_3_0: null,
        healthkitSource: sourceRev.bundleIdentifier,
        healthkitSourceName: sourceRev.name,
        healthkitDevice: workout.device?.localIdentifier,
        healthkitDeviceName: workout.device?.name,
        externalId: workout.uuid,
        externalSource: ExternalSource.APPLE_HEALTH,
      };
      const insertedRows = await trx.insert(schema.entries).values(entry).returning();
      const insertedRow = insertedRows[0];
      if (!insertedRow) {
        throw new Error('Failed to insert entry');
      }
    });
  }

  async createMealEntry(
    userId: number,
    title: string | null,
    note: string | null,
    image: string | null,
    meal: AppMeal): Promise<void> {
    const db = await asyncDrizzle();
    await transactionAsync(db, async (trx) => {
      const type = EntryType.MEAL;
      const service = this.entryServices[type].service;
      const id = uuid.v4();
      const objectId = await service.create(meal, trx);
      const entry: typeof schema.entries.$inferInsert = {
        id: id,
        userId: userId,
        type: type,
        time: new Date(),
        createdAt: new Date(),
        visibility: EntryVisibility.PUBLIC,
        imageId: null,
        note: note,
        title: title,
      };

      if (image) {
        const newImage: typeof schema.images.$inferInsert = {
          userId: userId,
          image: image,
          type: ImageType.ENTRY,
        };
        const imageRows = await trx.insert(schema.images).values(newImage).returning();
        let imageRow = imageRows[0];
        if (!imageRow) {
          throw new Error('Failed to insert image');
        }
        entry.imageId = imageRow.id;
      }

      const key = this.entryServices.Meal.key;
      entry[key] = objectId;
      await trx.insert(schema.entries).values(entry);
    });
  }

  async addPostEntry(userId: number, time: Date, note: string | null, image: string | null): Promise<PostAppEntry> {
    const result = await this.db.transaction(async (db) => {
      const newPost: typeof schema.entries.$inferInsert = {
        id: uuid.v4(),
        userId: userId,
        type: EntryType.POST,
        time: time,
        createdAt: new Date(),
        visibility: EntryVisibility.PUBLIC,
        imageId: null,
        note: note,
      };

      const appImage: AppImage | null = null;
      if (image) {
        const newImage: typeof schema.images.$inferInsert = {
          userId: userId,
          image: image,
          type: ImageType.ENTRY,
        };
        const imageRows = await db.insert(schema.images).values(newImage).returning();
        let imageRow = imageRows[0];
        if (!imageRow) {
          throw new Error('Failed to insert image');
        }
        newPost.imageId = imageRow.id;
      }

      const entryResult = await db.insert(schema.entries).values(newPost).returning();
      const entry = entryResult[0];
      if (!entry) {
        throw new Error('Failed to insert entry');
      }
      const result: PostAppEntry = {
        ...entry,
        type: EntryType.POST,
        image: appImage,
      };
      return result;
    });
    return result;
  }

  async addWeightEntry(userId: number): Promise<WeightAppEntry> {
    const result = await this.db.transaction(async (db) => {
      const lastWeight = await db.query.entries.findFirst({
        where: (t, op) =>
          op.and(
            op.eq(t.userId, userId),
            op.isNull(t.deletedAt),
            op.eq(t.type, EntryType.WEIGHT),
          ),
        with: {
          weight: true,
        },
        orderBy: (t, op) => [op.desc(t.createdAt)],
      });

      const newWeight: typeof schema.weight.$inferInsert = {
        externalId: null,
        userId: userId,
        weight: lastWeight?.weight?.weight ?? 50,
        units: 'Kg',
        createdAt: new Date(),
      };

      const insertResult = await db.insert(schema.weight).values(newWeight);
      const entry: Omit<WeightAppEntry, 'weight'> = {
        id: uuid.v4(),
        userId: userId,
        time: new Date(),
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        visibility: EntryVisibility.PUBLIC,
        type: EntryType.WEIGHT,
        lastPulledAt: null,
        lastPushedAt: null,
        workoutId: null,
        weightId: insertResult.lastInsertRowId,
        imageId: null,
        image: null,
        title: null,
        note: null,
        healthkitId: null,
        healthkitAnchor: null,
        healthkitAnchors_3_0: null,
        healthkitSource: null,
        healthkitSourceName: null,
        healthkitDevice: null,
        healthkitDeviceName: null,
        externalId: null,
        externalSource: null,
        outdoorRunId: null,
        outdoorWalkId: null,
        mealId: null,
        calorieGoalId: null,
      };
      this.logger.info('Inserting entry', entry);
      await db.insert(schema.entries).values(entry);

      const result: WeightAppEntry = {
        ...entry,
        type: EntryType.WEIGHT,
        weight: {
          ...newWeight,
          id: insertResult.lastInsertRowId,
          externalId: null,
          updatedAt: null,
          deletedAt: null,
        },
      };
      return result;
    });
    return result;

  }

  async addWorkoutEntry(userId: number): Promise<WorkoutAppEntry> {
    const result = await this.db.transaction(async (db) => {
      this.logger.info('Adding workout entry');
      const newWorkout: NewModel<AppWorkout> = {
        externalId: null,
        typeId: null,
        userId: userId,
        calories: 0,
        start: new Date(),
        end: null,
        createdAt: new Date(),
        updatedAt: null,
        lastPulledAt: null,
        lastPushedAt: null,
        deletedAt: null,
      };
      const insertResult = await db.insert(schema.workouts)
        .values(newWorkout);
      const entry: typeof schema.entries.$inferInsert = {
        id: uuid.v4(),
        workoutId: insertResult.lastInsertRowId,
        userId: userId,
        createdAt: new Date(),
        time: new Date(),
        updatedAt: null,
        deletedAt: null,
        visibility: EntryVisibility.PUBLIC,
        type: EntryType.WORKOUT,
        // remoteId: null,
        lastPulledAt: null,
        lastPushedAt: null,
        weightId: null,
        imageId: null,
        // image: null,
        title: null,
        note: null,
        healthkitId: null,
        healthkitAnchor: null,
        healthkitAnchors_3_0: null,
        healthkitSource: null,
        healthkitSourceName: null,
        healthkitDevice: null,
        healthkitDeviceName: null,
        externalId: null,
        externalSource: null,
        outdoorRunId: null,
        outdoorWalkId: null,
      };
      this.logger.info('Inserting entry', entry);
      const entryResult = await db.insert(schema.entries).values(entry).returning();
      const entryRow = entryResult[0];
      if (!entryRow) {
        throw new Error('Failed to insert entry');
      }
      const result: WorkoutAppEntry = {
        ...entryRow,
        image: null,
        type: EntryType.WORKOUT,
        workout: {
          ...newWorkout,
          id: insertResult.lastInsertRowId,
          exercises: [],
        },
      };
      return result;
    });
    return result;
  }

  async copyWorkout(workout: CompleteAppWorkout): Promise<WorkoutAppEntry> {
    const now = new Date();
    const result = await this.db.transaction(async (db) => {
      const copiedWorkout = await this.workoutService.copyWorkout(workout, db);
      const entry: typeof schema.entries.$inferInsert = {
        id: uuid.v4(),
        workoutId: copiedWorkout.id,
        userId: workout.userId,
        createdAt: now,
        time: now,
        updatedAt: null,
        deletedAt: null,
        visibility: EntryVisibility.PUBLIC,
        type: EntryType.WORKOUT,
        // remoteId: null,
        lastPulledAt: null,
        lastPushedAt: null,
        weightId: null,
        imageId: null,
        // image: null,
        title: null,
        note: null,
        healthkitId: null,
        healthkitAnchor: null,
        healthkitAnchors_3_0: null,
        healthkitSource: null,
        healthkitSourceName: null,
        healthkitDevice: null,
        healthkitDeviceName: null,
        externalId: null,
        externalSource: null,
        outdoorRunId: null,
        outdoorWalkId: null,
      };
      const entryResult = await db.insert(schema.entries).values(entry).returning();
      const entryRow = entryResult[0];
      if (!entryRow) {
        throw new Error('Failed to insert entry');
      }
      const result: WorkoutAppEntry = {
        ...entryRow,
        image: null,
        type: EntryType.WORKOUT,
        workout: copiedWorkout,
      };
      return result;
    });
    return result;
  }
}
