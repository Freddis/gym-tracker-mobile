import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {schema} from '../../db/schema';
import {Entry, EntryType, EntryUpsertDto, EntryVisibility, Weight, Workout} from '../../openapi-client';
import {AppEntry, WeightAppEntry, WorkoutAppEntry} from '../../types/models/AppEntry';
import {AppWorkout, CompleteAppWorkout} from '../../types/models/AppWorkout';
import {NewModel} from '../../types/NewModel';
import {ApiService} from '../ApiService/ApiService';
import {DrizzleDb, conflictUpdateSetAllColumns} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {WeightService} from '../WeightService/WeightService';
import {WorkoutService} from '../WorkoutService/WorkoutService';
import {eq} from 'drizzle-orm';
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
    private readonly db: DrizzleDb,
  ) {
    this.logger = new Logger(EntryService.name);
  }

  async pullFromServer(db: DrizzleDb): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(db);
    // const result = await db.transaction(async (db) => {
    let page = 1;
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
    for (const item of items) {
      if (item.workout) {
        workouts.push(item.workout);
        continue;
      }
      if (item.weight) {
        weights.push(item.weight);
        continue;
      }
      throw new Error(`Unknown entry type: ${item.type}`);
    }
    const workoutMap = await this.workoutService.processedPulledItem(db, workouts);
    const weightMap = await this.weightService.processedPulledItems(db, weights);

    for (const x of items) {
      const workoutId = workoutMap.get(x.workout?.id ?? 0);
      const weightId = weightMap.get(x.weight?.id ?? 0);
      const entry: typeof schema.entries.$inferInsert = {
        userId: x.user.id,
        type: x.type,
        weightId: weightId,
        workoutId: workoutId,
        visibility: x.visibility,
        externalId: x.id,
        lastPulledAt: new Date(),
        lastPushedAt: new Date(),
        createdAt: x.createdAt,
        deletedAt: x.deletedAt,
        updatedAt: x.updatedAt,
      };
      const existing = await db.query.entries.findFirst({
        where: (t, op) => op.eq(t.externalId, x.id),
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

  async deleteEntry(entryId: number) {
    await this.db.update(schema.entries).set({
      deletedAt: new Date(),
    }).where(
      eq(schema.entries.id, entryId)
    );
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await this.weightService.wipeLocalData(db);
    await this.workoutService.wipeLocalData(db);
    await db.delete(schema.entries);
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
    await this.db.update(schema.entries).set({
      externalId: response.data.items[0].id,
    }).where(
      eq(schema.entries.id, entry.id)
    );
    return true;
  }

  protected createUpsertDto(entry: AppEntry): EntryUpsertDto {
    const data: EntryUpsertDto = entry.type === EntryType.WORKOUT ? {
      id: entry.externalId ?? undefined,
      visibility: entry.visibility,
      createdAt: entry.createdAt,
      deletedAt: entry.deletedAt,
      type: entry.type,
      workout: entry.workout,
      updatedAt: entry.updatedAt,
    } : {
      id: entry.externalId ?? undefined,
      visibility: entry.visibility,
      createdAt: entry.createdAt,
      deletedAt: entry.deletedAt,
      type: entry.type,
      weight: entry.weight,
      updatedAt: entry.updatedAt,
    };
    return data;
  }
  async saveEntry(entry: AppEntry) {
    if (entry.type === EntryType.WEIGHT) {
      await this.db.update(schema.weight).set({
        ...entry.weight,
        updatedAt: new Date(),
      }).where(
        eq(schema.weight.id, entry.weight.id)
      );
    }
  }

  useWorkoutEntry(workoutId: number, args: unknown[]) {
    const query = this.db.query.entries.findFirst({
      where: (t, op) => op.eq(t.workoutId, workoutId),
      with: {
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

  useWeightEntry(entryId: number, arg1: (string | number | string[] | undefined)[]) {
    const query = this.db.query.entries.findFirst({
      where: (t, op) => op.eq(t.id, entryId),
      with: {
        weight: true,
      },
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryResult = useLiveQuery(query, arg1);
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

  async getEntries(
    db: DrizzleDb,
    params?: {
      ids?: number[],
      limit?: number,
      updatedAt?: Date,
      includeDeleted?: boolean,
    }
  ): Promise<AppEntry[]> {
    const sqlQuery = db.query.entries.findMany({
      with: {
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
      },
      where: (t, op) => op.and(
        params?.ids ? op.inArray(t.id, params.ids) : undefined,
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
      throw new Error('Unknown entry type');
    }
    return result;
  }

  async getEntry(id: number): Promise<AppEntry> {
    const entries = await this.getEntries(this.db, {ids: [id]});
    if (!entries[0]) {
      throw new Error('Entry not found');
    }
    return entries[0];
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
        externalId: entry.id,
      }).where(
        eq(schema.entries.id, entriesToUpsert[i].id)
      );
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
      const entry: Omit<WeightAppEntry, 'weight' | 'id'> = {
        userId: userId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        visibility: EntryVisibility.PUBLIC,
        type: EntryType.WEIGHT,
        externalId: null,
        lastPulledAt: null,
        lastPushedAt: null,
        workoutId: null,
        weightId: insertResult.lastInsertRowId,
      };
      this.logger.info('Inserting entry', entry);
      const entryResult = await db.insert(schema.entries).values(entry);

      const result: WeightAppEntry = {
        id: entryResult.lastInsertRowId,
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
      const entry: NewModel<AppEntry> = {
        workoutId: insertResult.lastInsertRowId,
        userId: userId,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        visibility: EntryVisibility.PUBLIC,
        type: EntryType.WORKOUT,
        externalId: null,
        lastPulledAt: null,
        lastPushedAt: null,
        weightId: null,
      };
      this.logger.info('Inserting entry', entry);
      const entryResult = await db.insert(schema.entries).values(entry);
      const result: WorkoutAppEntry = {
        id: entryResult.lastInsertRowId,
        ...entry,
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
      const entry: NewModel<AppEntry> = {
        workoutId: copiedWorkout.id,
        userId: workout.userId,
        createdAt: now,
        updatedAt: null,
        deletedAt: null,
        visibility: EntryVisibility.PUBLIC,
        type: EntryType.WORKOUT,
        externalId: null,
        lastPulledAt: null,
        lastPushedAt: null,
        weightId: null,
      };
      const entryResult = await db.insert(schema.entries).values(entry);
      const result: WorkoutAppEntry = {
        id: entryResult.lastInsertRowId,
        ...entry,
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
