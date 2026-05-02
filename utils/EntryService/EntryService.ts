import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {schema} from '../../db/schema';
import {
  Entry,
  EntryType,
  EntryUpsertDto,
  EntryVisibility,
  Weight,
  Workout,
  Image,
  OutdoorRunEntryUpsertDto,
  WorkoutEntryUpsertDto,
  OutdoorRun,
  OutdoorWalkEntryUpsertDto,
  OutdoorWalk,
  ExternalSource,
  ImageType,
} from '../../openapi-client';
import {AppEntry, PostAppEntry, WeightAppEntry, WorkoutAppEntry} from '../../types/models/AppEntry';
import {AppWorkout, CompleteAppWorkout} from '../../types/models/AppWorkout';
import {NewModel} from '../../types/NewModel';
import {ApiService} from '../ApiService/ApiService';
import {DrizzleDb} from '../drizzle';
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
import {v4} from 'uuid';

export type LiveQueryQueryResult<T> = {
  data: T | undefined;
  error: Error | undefined;
  updatedAt: Date | undefined;
}
export class EntryService {
  protected logger: Logger = new Logger(EntryService.name);

  constructor(
    private readonly api: ApiService,
    private readonly weightService: WeightService,
    private readonly workoutService: WorkoutService,
    private readonly imageService: ImageService,
    private readonly outdoorRunService: OutdoorRunService,
    private readonly outdoorWalkService: OutdoorWalkService,
    private readonly db: DrizzleDb,
  ) {
    this.logger = new Logger(EntryService.name);
  }

  async pullFromServer(db: DrizzleDb, _userId: number, progress: StageProgressCallback): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);
    // const result = await db.transaction(async (db) => {
    let page = 1;
    let processedItems = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await this.api.client().getEntriesOwn({
        query: {
          updatedAfter: lastUpdateFromServer ?? undefined,
          includeDeleted: true,
          page: page++,
        },
      });
      if (response.error) {
        return false;
      }
      progress({itemsDone: processedItems, itemsNumber: response.data.info.count});
      processedItems += response.data.items.length;
      await this.processedPulledItem(db, response.data.items);
      if (response.data.items.length < response.data.info.pageSize) {
        return true;
      }
    }
    // });
    // return result;
  }

  protected async processedPulledItem(db: DrizzleDb, items: Entry[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const workouts: Workout[] = [];
    const weights: Weight[] = [];
    const images: Image[] = [];
    const outdoorRuns: OutdoorRun[] = [];
    const outdoorWalks: OutdoorWalk[] = [];
    for (const item of items) {
      if (item.image) {
        images.push(item.image);
      }
      if (item.workout) {
        workouts.push(item.workout);
        continue;
      }
      if (item.weight) {
        weights.push(item.weight);
        continue;
      }
      if (item.outdoorRun) {
        outdoorRuns.push(item.outdoorRun);
        continue;
      }
      if (item.outdoorWalk) {
        outdoorWalks.push(item.outdoorWalk);
        continue;
      }
      if (item.type === EntryType.POST) {
        continue;
      }
      throw new Error(`Unknown entry type: ${item.type}`);
    }
    const workoutMap = await this.workoutService.processedPulledItem(db, workouts);
    const weightMap = await this.weightService.processedPulledItems(db, weights);
    const imageMap = await this.imageService.processedPulledItems(db, images);
    const outdoorRunMap = await this.outdoorRunService.processedPulledItems(db, outdoorRuns);
    const outdoorWalkMap = await this.outdoorWalkService.processedPulledItems(db, outdoorWalks);

    for (const x of items) {
      const workoutId = workoutMap.get(x.workout?.id ?? 0);
      const weightId = weightMap.get(x.weight?.id ?? 0);
      const imageId = imageMap.get(x.image?.id ?? 0);
      const outdoorRunId = outdoorRunMap.get(x.outdoorRun?.id ?? 0);
      const outdoorWalkId = outdoorWalkMap.get(x.outdoorWalk?.id ?? 0);
      const entry: typeof schema.entries.$inferInsert = {
        id: x.id,
        userId: x.user.id,
        type: x.type,
        weightId: weightId,
        workoutId: workoutId,
        imageId: imageId,
        outdoorRunId: outdoorRunId,
        outdoorWalkId: outdoorWalkId,
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
      };
      const existing = await db.query.entries.findFirst({
        where: (t, op) => op.eq(t.id, x.id),
      });
      if (!existing) {
        await db.insert(schema.entries).values(entry);
        continue;
      }
      const lastUpdateStampOwn = Math.max(existing.createdAt.getTime(), existing.updatedAt?.getTime() ?? 0, existing.deletedAt?.getTime() ?? 0);
      const lastUpdateStampServer = Math.max(x.createdAt.getTime(), x.updatedAt?.getTime() ?? 0, x.deletedAt?.getTime() ?? 0);
      if (lastUpdateStampOwn >= lastUpdateStampServer) {
        continue;
      }
      await db.update(schema.entries).set(entry).where(eq(schema.entries.id, existing.id));
    }
  }

  async deleteEntryFromDb(entry: AppEntry, db: DrizzleDb): Promise<void> {
    await db.delete(schema.entries).where(eq(schema.entries.id, entry.id));
    if (entry.type === EntryType.WEIGHT) {
      // await this.weightService.deleteById(entry.weight.id, db);
    }
    if (entry.type === EntryType.WORKOUT) {
      // await this.workoutService.deleteById(entry.workout.id, db);
    }
    if (entry.type === EntryType.OUTDOOR_RUN) {
      await this.outdoorRunService.deleteById(entry.outdoorRun.id, db);
    }
    if (entry.type === EntryType.OUTDOOR_WALK) {
      await this.outdoorWalkService.deleteById(entry.outdoorWalk.id, db);
    }
  }

  async deleteEntry(entryId: string) {
    await this.db.update(schema.entries).set({
      deletedAt: new Date(),
    }).where(
      eq(schema.entries.id, entryId)
    );
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.entries);
    await this.weightService.wipeLocalData(db);
    await this.workoutService.wipeLocalData(db);
    await this.outdoorRunService.wipeLocalData(db);
    await this.outdoorWalkService.wipeLocalData(db);
    await this.imageService.wipeLocalData(db);
    return true;
  }

  async pushEntry(entry: AppEntry): Promise<boolean> {
    const data: EntryUpsertDto = this.createUpsertDto(entry);
    const response = await this.api.client().putEntries({
      body: {
        items: [data],
      },
    });
    if (!response.data || !response.data.items[0]) {
      return false;
    }
    return true;
  }

  protected createUpsertDto(entry: AppEntry): EntryUpsertDto {
    const image = entry.image ? {
      id: entry.image.id,
      url: entry.image.url,
      imageType: entry.image.type,
      data: entry.image.image,
    } : null;
    if (entry.type === EntryType.WORKOUT) {
      const data: WorkoutEntryUpsertDto = {
        id: entry.id,
        visibility: entry.visibility,
        time: entry.time,
        createdAt: entry.createdAt,
        deletedAt: entry.deletedAt,
        type: entry.type,
        title: entry.title,
        note: entry.note,
        image: image,
        workout: {
          ...entry.workout,
          exercises: entry.workout.exercises.map((x) => ({
            exerciseId: x.exercise.id,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            sets: x.sets,
          })),
        },
        updatedAt: entry.updatedAt,
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
      return data;
    }
    if (entry.type === EntryType.WEIGHT) {
      const data: EntryUpsertDto = {
        id: entry.id,
        visibility: entry.visibility,
        time: entry.time,
        createdAt: entry.createdAt,
        deletedAt: entry.deletedAt,
        type: entry.type,
        weight: entry.weight,
        updatedAt: entry.updatedAt,
        title: entry.title,
        note: entry.note,
        image: image,
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
      return data;
    }
    if (entry.type === EntryType.OUTDOOR_RUN) {
      const data: OutdoorRunEntryUpsertDto = {
        id: entry.id,
        visibility: entry.visibility,
        time: entry.time,
        createdAt: entry.createdAt,
        deletedAt: entry.deletedAt,
        type: entry.type,
        outdoorRun: entry.outdoorRun,
        updatedAt: entry.updatedAt,
        title: entry.title,
        note: entry.note,
        image: image,
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
      return data;
    }

    if (entry.type === EntryType.OUTDOOR_WALK) {
      const data: OutdoorWalkEntryUpsertDto = {
        id: entry.id,
        visibility: entry.visibility,
        time: entry.time,
        createdAt: entry.createdAt,
        deletedAt: entry.deletedAt,
        type: entry.type,
        outdoorWalk: entry.outdoorWalk,
        updatedAt: entry.updatedAt,
        title: entry.title,
        note: entry.note,
        image: image,
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
      return data;
    }

    const data: EntryUpsertDto = {
      id: entry.id,
      visibility: entry.visibility,
      time: entry.time,
      createdAt: entry.createdAt,
      deletedAt: entry.deletedAt,
      type: entry.type,
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
    return data;
  }

  async saveEntry(entry: AppEntry, image?: string | null) {
    await this.db.transaction(async (db) => {
      if (image !== undefined) {
        await this.updateEntryImage(db, entry, image);
      }

      if (entry.type === EntryType.WEIGHT) {
        await db.update(schema.weight).set({
          ...entry.weight,
          updatedAt: new Date(),
        }).where(
        eq(schema.weight.id, entry.weight.id)
      );
      }
      if (entry.type === EntryType.WORKOUT) {
        await db.update(schema.workouts).set({
          ...entry.workout,
          updatedAt: new Date(),
        }).where(
        eq(schema.workouts.id, entry.workout.id)
      );
      }
      await db.update(schema.entries).set({
        note: entry.note,
        imageId: entry.imageId,
        title: entry.title,
        visibility: entry.visibility,
        time: entry.time,
        updatedAt: new Date(),
      }).where(
      eq(schema.entries.id, entry.id)
      );

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

  useWorkoutEntry(workoutId: number, args: unknown[]) {
    const query = this.db.query.entries.findFirst({
      where: (t, op) => op.eq(t.workoutId, workoutId),
      with: {
        image: true,
        workout: {
          with: {
            exercises: {
              with: {
                exercise: true,
                sets: true,
              },
            },
            sets: {
              with: {
                exercise: true,
              },
            },
          },
        },
      },
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryResult = useLiveQuery(query, args);

    if (!queryResult.data) {
      return {
        data: undefined,
        error: queryResult.error,
        updatedAt: queryResult.updatedAt,
      };
    }

    if (!queryResult.data.workout) {
      throw new Error('Workout not found');
    }
    const wrappedResult: LiveQueryQueryResult<WorkoutAppEntry> = {
      ...queryResult,
      data: {
        ...queryResult.data,
        type: EntryType.WORKOUT,
        workout: queryResult.data.workout,
      },
    };
    return wrappedResult;
  }

  useWeightEntry(entryId: string, queryKey: (string | number | string[] | undefined)[]) {
    const query = this.db.query.entries.findFirst({
      where: (t, op) => op.eq(t.id, entryId),
      with: {
        image: true,
        weight: true,
      },
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryResult = useLiveQuery(query, queryKey);
    if (!queryResult.data) {
      return {
        data: undefined,
        error: queryResult.error,
        updatedAt: queryResult.updatedAt,
      };
    }

    if (!queryResult.data.weight) {
      throw new Error('Workout not found');
    }
    const wrappedResult: LiveQueryQueryResult<WeightAppEntry> = {
      ...queryResult,
      data: {
        ...queryResult.data,
        type: EntryType.WEIGHT,
        weight: queryResult.data.weight,
      },
    };
    return wrappedResult;
  }

  usePostEntry(entryId: string, queryKey: (string | number | string[] | undefined)[]) {
    const query = this.db.query.entries.findFirst({
      where: (t, op) => op.eq(t.id, entryId),
      with: {
        image: true,
        weight: true,
      },
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryResult = useLiveQuery(query, queryKey);
    if (!queryResult.data) {
      return {
        data: undefined,
        error: queryResult.error,
        updatedAt: queryResult.updatedAt,
      };
    }

    const wrappedResult: LiveQueryQueryResult<PostAppEntry> = {
      ...queryResult,
      data: {
        ...queryResult.data,
        type: EntryType.POST,
      },
    };
    return wrappedResult;
  }

  async getEntries(
    db: DrizzleDb,
    params?: {
      externalIds?: string[],
      ids?: string[],
      limit?: number,
      updatedAt?: Date,
      includeDeleted?: boolean,
    }
  ): Promise<AppEntry[]> {
    const sqlQuery = db.query.entries.findMany({
      with: {
        image: true,
        workout: {
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
        },
        weight: true,
        outdoorRun: {
          with: {
            geoData: true,
            heartRateData: true,
          },
        },
        outdoorWalk: {
          with: {
            geoData: true,
            heartRateData: true,
          },
        },
      },
      where: (t, op) => op.and(
        params?.ids ? op.inArray(t.id, params.ids) : undefined,
        params?.externalIds ? op.inArray(t.externalId, params.externalIds) : undefined,
        params?.includeDeleted ? undefined : op.isNull(t.deletedAt),
      ),
      orderBy: (t, op) => op.desc(t.createdAt),
      limit: params?.limit,
    });
    const entries = await sqlQuery;
    const result: AppEntry[] = [];
    for (const item of entries) {
      if (item.type === EntryType.WORKOUT && item.workout) {
        result.push({
          ...item,
          type: EntryType.WORKOUT,
          workout: item.workout,
        });
        continue;
      }
      if (item.type === EntryType.WEIGHT && item.weight) {
        result.push({
          ...item,
          type: EntryType.WEIGHT,
          weight: item.weight,
        });
        continue;
      }
      if (item.type === EntryType.POST) {
        result.push({
          ...item,
          type: EntryType.POST,
          image: item.image,
        });
        continue;
      }
      if (item.type === EntryType.OUTDOOR_RUN && item.outdoorRun) {
        result.push({
          ...item,
          type: EntryType.OUTDOOR_RUN,
          outdoorRun: item.outdoorRun,
        });
        continue;
      }
      if (item.type === EntryType.OUTDOOR_WALK && item.outdoorWalk) {
        result.push({
          ...item,
          type: EntryType.OUTDOOR_WALK,
          outdoorWalk: item.outdoorWalk,
        });
        continue;
      }
      throw new Error('Unknown entry type');
    }
    return result;
  }

  async getEntry(id: string): Promise<AppEntry> {
    const entries = await this.getEntries(this.db, {ids: [id]});
    if (!entries[0]) {
      throw new Error('Entry not found');
    }
    return entries[0];
  }

  async getEntryByExternalId(externalId: string): Promise<AppEntry | null> {
    const entries = await this.getEntries(this.db, {externalIds: [externalId]});
    return entries[0] ?? null;
  }

  async pushToServer(db: DrizzleDb, userId: number): Promise<boolean> {
    this.logger.info('Pushing entries to server', {userId});
    const lastPullSyncDate = await this.getLatestPushSyncDate(db);
    const idRows = await db.query.entries.findMany({
      columns: {
        id: true,
      },
      where: (t, op) => op.and(
        eq(t.userId, userId),
        lastPullSyncDate ? op.or(
          op.gt(t.updatedAt, lastPullSyncDate),
          op.gt(t.createdAt, lastPullSyncDate),
          op.gt(t.deletedAt, lastPullSyncDate),
        ) : undefined
      ),
    });
    if (idRows.length === 0) {
      return true;
    }
    this.logger.info('Getting entries to upsert', {ids: idRows.map((x) => x.id)});
    const entriesToUpsert: AppEntry[] = await this.getEntries(db, {
      ids: idRows.map((x) => x.id),
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
    const row = await db.query.entries.findFirst({
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

  async importFromHealthKit(
    user: AuthUser,
    workout: WorkoutProxyTyped,
    hr: readonly QuantitySampleTyped<'HKQuantityTypeIdentifierHeartRate'>[]
  ): Promise<void> {
    await this.db.transaction(async (db) => {
      this.logger.info('Getting existing entry by external id', {externalId: workout.uuid});
      const existing = await this.getEntryByExternalId(workout.uuid);
      let createdAt: Date = existing?.createdAt ?? new Date();
      let updatedAt: Date | null = existing ? new Date() : null;
      // let remoteId = existing?.remoteId ?? null;
      if (existing) {
        this.logger.info('Deleting existing entry', {id: existing.id});
        await this.deleteEntryFromDb(existing, db);
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
        walk = await this.outdoorWalkService.import(user, workout, routes, hr, db);
        time = walk.start;
      }
      if (type === EntryType.OUTDOOR_RUN) {
        run = await this.outdoorRunService.import(user, workout, routes, hr, db);
        time = run.start;
      }
      console.log(workout.sourceRevision.source.toJSON());
      console.log(workout.device);
      // For some reason name in non JSON version is SourceProxy. Weird.
      const sourceRev = workout.sourceRevision.source.toJSON();
      const entry: typeof schema.entries.$inferInsert = {
        id: v4(),
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
      const insertedRows = await db.insert(schema.entries).values(entry).returning();
      const insertedRow = insertedRows[0];
      if (!insertedRow) {
        throw new Error('Failed to insert entry');
      }
    });
  }

  async addPostEntry(userId: number, note: string | null, image: string | null): Promise<PostAppEntry> {
    const result = await this.db.transaction(async (db) => {
      const newPost: typeof schema.entries.$inferInsert = {
        id: v4(),
        userId: userId,
        type: EntryType.POST,
        time: new Date(),
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
        imageRow = {
          ...imageRow,
        };
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
        id: v4(),
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
        id: v4(),
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
        id: v4(),
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

  // async getPage(db: DrizzleDb): Promise<AppWorkout[]> {
  //   const rows = await db.query.entries.findMany({
  //     where: (t, op) => op.and(
  //       op.isNull(t.deletedAt)
  //     ),
  //     orderBy: (t, op) => op.desc(t.createdAt),
  //     limit: 50,
  //   });

  //   const workoutIds = rows.map((x) => x.workoutId).filter((x) => x !== null);
  //   this.workoutService.getPage(this.db, workoutIds);

  // }
}
