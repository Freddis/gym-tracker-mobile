import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {Entry, EntryType, OutdoorWalk, OutdoorWalkEntryUpsertDto, PostEntryUpsertDto} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {asyncDrizzle, conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {QuantitySampleTyped, WorkoutActivityType, WorkoutProxyTyped, WorkoutRouteLocation} from '@kingstinct/react-native-healthkit';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';
import {AppOutdoorWalk} from '../../types/models/AppOutdoorWalk';
import {batch} from '../batch';
import {IEntryService} from '../../types/IEntryService';
import {BaseEntry, OutdoorWalkAppEntry} from '../../types/models/AppEntry';
import {AppPathDataPoint} from '../../types/models/AppPathDataPoint';
import {transactionAsync} from '../runTransaction';
import {EntryRepositoryService} from '../EntryRepositoryService/EntryRepositoryService';
import {EntryCreateParams} from '../EntryRepositoryService/types/EntryCreateParams';
import {PathUtility} from '../PathUtility/PathUtility';

export class OutdoorWalkService implements IEntryService<EntryType.OUTDOOR_WALK> {
  protected logger: Logger;
  protected entryRepositoryService = new EntryRepositoryService();
  protected pathUtility = new PathUtility();

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(OutdoorWalkService.name);
  }
  async create(outdoorWalk: AppOutdoorWalk, db: DrizzleDb): Promise<number> {
    throw new Error('Not implemented');
  }

  async update(entry: OutdoorWalkAppEntry, trx: DrizzleDb): Promise<void> {

  }

  async loadMap(ids: number[], db?: DrizzleDb): Promise<Map<number, AppOutdoorWalk>> {
    const trx = db ?? this.db;
    const outdoorWalks: AppOutdoorWalk[] = await trx.query.outdoorWalks.findMany({
      where: (t, op) => op.inArray(t.id, ids),
      with: {
        geoData: true,
        heartRateData: true,
      },
    });
    return new Map(outdoorWalks.map((x) => [x.id, x]));
  }

  construct(row: BaseEntry, value: AppOutdoorWalk): OutdoorWalkAppEntry & {type: EntryType.OUTDOOR_WALK;} {
    return {
      ...row,
      type: EntryType.OUTDOOR_WALK,
      outdoorWalk: value,
    };
  }

  getUpsertDto(entry: OutdoorWalkAppEntry, dto: PostEntryUpsertDto): OutdoorWalkEntryUpsertDto {
    const data: OutdoorWalkEntryUpsertDto = {
      ...dto,
      type: 'OutdoorWalk',
      outdoorWalk: {
        ...entry.outdoorWalk,
      },
    };
    return data;
  }

  async createEntry(user: AuthUser, start: Date, end: Date, path: AppPathDataPoint[], entryParams?: EntryCreateParams): Promise<OutdoorWalkAppEntry> {
    const db = await asyncDrizzle();
    return await transactionAsync(db, async (trx) => {
      const smoothed = await this.normalizePath(path);
      const duration = Math.round((end.getTime() - start.getTime()) / 1000);
      const distance = this.pathUtility.totalDistance(smoothed);
      const pace = distance / duration;
      const outdoorWalk: OutdoorWalk = {
        duration: duration,
        distance: distance,
        pace: pace,
        maxPace: 0,
        calories: duration * 0.05,
        start: start,
        end: end,
        id: 0,
        userId: user.id,
        cadence: null,
        maxCadence: null,
        heartRate: null,
        maxHeartRate: null,
        elevationGain: null,
        heartRateData: null,
        geoData: smoothed,
      };
      const recordMap = await this.processPulledItems(trx, [['noMatter', outdoorWalk]]);
      const map = await this.loadMap(Array.from(recordMap.values()), trx);
      const values = Array.from(map.values());
      const walk = values[0];
      if (!walk) {
        throw new Error('Outdoor walk not found');
      }
      const entry = await this.entryRepositoryService.create(trx, user, EntryType.OUTDOOR_WALK, 'outdoorWalkId', walk.id, {
        ...entryParams,
        time: start,
      });
      const result = this.construct(entry, walk);
      return result;
    });
  }

  async deleteById(id: number, db: DrizzleDb): Promise<void> {
    await db.delete(schema.outdoorWalkGeoData).where(eq(schema.outdoorWalkGeoData.outdoorWalkId, id));
    await db.delete(schema.outdoorWalkHeartrateData).where(eq(schema.outdoorWalkHeartrateData.outdoorWalkId, id));
    await db.delete(schema.outdoorWalks).where(eq(schema.outdoorWalks.id, id));
  }

  getObject(entry: Entry): OutdoorWalk | null {
    return entry.outdoorWalk ?? null;
  }

  async import(
    user: AuthUser,
    workout: WorkoutProxyTyped,
    routes: WorkoutRouteLocation[],
    hr: readonly QuantitySampleTyped<'HKQuantityTypeIdentifierHeartRate'>[],
    db: DrizzleDb
  ): Promise<AppOutdoorWalk> {
    if (workout.workoutActivityType !== WorkoutActivityType.walking) {
      throw new Error('Workout activity type is not walking');
    }
    const distance = workout.totalDistance?.quantity ?? 0;
    const duration = workout.duration.quantity;
    const pace = (duration / distance) * 1000;
    const maxPace = pace;
    const row: typeof schema.outdoorWalks.$inferInsert = {
      externalId: null,
      duration: workout.duration.quantity,
      userId: user.id,
      distance: distance,
      pace: pace,
      maxPace: maxPace,
      calories: workout.totalEnergyBurned?.quantity ?? 0,
      start: workout.startDate,
      end: workout.endDate,
    };

    const outdoorWalkRows = await db.insert(schema.outdoorWalks).values(row).returning();
    const outdoorWalkRow = outdoorWalkRows[0];
    if (!outdoorWalkRow) {
      throw new Error('Outdoor walk row not found');
    }
    const pathData: typeof schema.outdoorWalkGeoData.$inferInsert[] = routes.map((point) => {
      return {
        outdoorWalkId: outdoorWalkRow.id,
        latitude: point.latitude,
        longitude: point.longitude,
        altitude: point.altitude,
        timestamp: point.date.getTime() - workout.startDate.getTime(),
        distance: point.distance,
        course: point.course,
        speed: point.speed,
        speedAccuracy: point.speedAccuracy,
        horizontalAccuracy: point.horizontalAccuracy,
        verticalAccuracy: point.verticalAccuracy,
      };
    });
    // for (const pathDataItem of pathData) {
    //   await db.insert(schema.outdoorWalkGeoData).values(pathDataItem);
    // }
    if (pathData.length > 0) {
      await batch(pathData, 200, async (batch) => {
        return await db.insert(schema.outdoorWalkGeoData).values(batch).returning();
      });
    }
    const heartRateData: typeof schema.outdoorWalkHeartrateData.$inferInsert[] = hr.map((hr) => {
      return {
        outdoorWalkId: outdoorWalkRow.id,
        timestamp: hr.startDate.getTime() - workout.startDate.getTime(),
        heartRate: hr.quantity,
      };
    });
    // for (const heartRateDataItem of heartRateData) {
    //   await db.insert(schema.outdoorWalkHeartrateData).values(heartRateDataItem);
    // }
    if (heartRateData.length > 0) {
      await batch(heartRateData, 300, async (batch) => {
        return await db.insert(schema.outdoorWalkHeartrateData).values(batch).returning();
      });
    }

    const result: AppOutdoorWalk = {
      id: outdoorWalkRow.id,
      externalId: outdoorWalkRow.externalId,
      duration: outdoorWalkRow.duration,
      userId: outdoorWalkRow.userId,
      distance: outdoorWalkRow.distance,
      pace: outdoorWalkRow.pace,
      maxPace: outdoorWalkRow.maxPace,
      geoData: pathData.map((row) => ({
        timestamp: row.timestamp,
        latitude: row.latitude,
        longitude: row.longitude,
        altitude: row.altitude,
        course: row.course ?? null,
        speed: row.speed ?? null,
        speedAccuracy: row.speedAccuracy ?? null,
        horizontalAccuracy: row.horizontalAccuracy ?? null,
        verticalAccuracy: row.verticalAccuracy ?? null,
        distance: row.distance ?? null,
      })),
      heartRateData: heartRateData.map((row) => ({
        timestamp: row.timestamp,
        heartRate: row.heartRate,
      })),
      cadence: outdoorWalkRow.cadence,
      maxCadence: outdoorWalkRow.maxCadence,
      elevationGain: null,
      heartRate: outdoorWalkRow.heartRate,
      maxHeartRate: outdoorWalkRow.maxHeartRate,
      calories: outdoorWalkRow.calories,
      start: outdoorWalkRow.start,
      end: outdoorWalkRow.end,
    };
    return result;
  }

  async processPulledItems(db: DrizzleDb, items: [string, OutdoorWalk][]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (items.length === 0) {
      return map;
    }

    for (const [id, item] of items) {
      const input: typeof schema.outdoorWalks.$inferInsert = {
        externalId: item.id,
        duration: item.duration,
        userId: item.userId,
        distance: item.distance,
        pace: item.pace,
        maxPace: item.maxPace,
        calories: item.calories,
        start: item.start,
        end: item.end,
      };
      const rows = await db.insert(schema.outdoorWalks).values(input).onConflictDoUpdate({
        target: schema.outdoorWalks.externalId,
        set: conflictUpdateSetAllColumns(schema.outdoorWalks),
      }).returning();
      const row = rows[0];
      if (!row) {
        throw new Error('Outdoor walk not found');
      }
      map.set(id, row.id);
      const outdoorWalkId = row.id;
      const geoData: typeof schema.outdoorWalkGeoData.$inferInsert[] = item.geoData?.map((geoData) => {
        return {
          outdoorWalkId: outdoorWalkId,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          altitude: geoData.altitude,
          course: geoData.course,
          speed: geoData.speed,
          speedAccuracy: geoData.speedAccuracy,
          horizontalAccuracy: geoData.horizontalAccuracy,
          verticalAccuracy: geoData.verticalAccuracy,
          distance: geoData.distance,
          timestamp: geoData.timestamp,
        };
      }) ?? [];
      await db.delete(schema.outdoorWalkGeoData).where(eq(schema.outdoorWalkGeoData.outdoorWalkId, outdoorWalkId));
      if (geoData.length > 0) {
        await batch(geoData, 200, async (batch) => {
          return await db.insert(schema.outdoorWalkGeoData).values(batch).returning();
        });
      }
      const heartRateData: typeof schema.outdoorWalkHeartrateData.$inferInsert[] = item.heartRateData?.map((heartRateData) => {
        return {
          outdoorWalkId: outdoorWalkId,
          timestamp: heartRateData.timestamp,
          heartRate: heartRateData.heartRate,
        };
      }) ?? [];
      await db.delete(schema.outdoorWalkHeartrateData).where(eq(schema.outdoorWalkHeartrateData.outdoorWalkId, outdoorWalkId));
      if (heartRateData.length > 0) {
        await batch(heartRateData, 300, async (batch) => {
          return await db.insert(schema.outdoorWalkHeartrateData).values(batch).returning();
        });
      }
    }
    return map;
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.outdoorWalkGeoData);
    await db.delete(schema.outdoorWalkHeartrateData);
    await db.delete(schema.outdoorWalks);
    return true;
  }

  async normalizeEntry(outdoorWalk: AppOutdoorWalk): Promise<AppOutdoorWalk> {
    const smoothed = await this.normalizePath(outdoorWalk.geoData ?? []);
    const duration = Math.round((outdoorWalk.end.getTime() - outdoorWalk.start.getTime()) / 1000);
    const distance = this.pathUtility.totalDistance(smoothed);
    const pace = duration * 1000 / distance;
    const result: AppOutdoorWalk = {
      ...outdoorWalk,
      duration: duration,
      distance: distance,
      pace: pace,
      maxPace: 0,
      calories: duration * 0.05,
      cadence: null,
      maxCadence: null,
      heartRate: null,
      maxHeartRate: null,
      elevationGain: null,
      heartRateData: null,
      geoData: smoothed,
    };
    return result;
  }
  async normalizePath(geoData: AppPathDataPoint[]): Promise<AppPathDataPoint[]> {
    if (geoData.length === 0) {
      return [];
    }

    const MAX_ACCURACY = 25; // meters (tune: 25–50)
    const MAX_SPEED = 10; // m/s (~36 km/h walking buffer)
    const OUTLIER_FACTOR = 3;

    // 1. sort by time
    const points = [...geoData].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // 2. filter bad accuracy points early
    const filtered: AppPathDataPoint[] = [];
    for (const p of points) {
      if (
        p.horizontalAccuracy != null &&
        p.horizontalAccuracy > MAX_ACCURACY
      ) {
        continue;
      }
      filtered.push(p);
    }

    if (!filtered[0]) {
      return [];
    }

    const cleaned: AppPathDataPoint[] = [filtered[0]];
    // 3. outlier + speed filtering
    for (let i = 1; i < filtered.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      if (!prev) {
        continue;
      }
      const curr = filtered[i];
      if (!curr) {
        continue;
      }
      const dist = this.pathUtility.haversine(prev, curr);
      const speed = this.pathUtility.computeSpeed(prev, curr, dist);

      // speed spike filter (stairs / jumps / GPS glitches)
      if (speed > MAX_SPEED) {
        continue;
      }

      // geometric outlier check (optional but very effective)
      if (cleaned.length >= 2) {
        const prevPrev = cleaned[cleaned.length - 2];
        if (!prevPrev) {
          continue;
        }
        const ab = this.pathUtility.haversine(prevPrev, curr);
        const ax = this.pathUtility.haversine(prevPrev, prev);
        const xb = dist;

        if (ax + xb > ab * OUTLIER_FACTOR) {
          // prev is likely a spike → remove it instead of adding curr
          cleaned.pop();
          continue;
        }
      }

      cleaned.push(curr);
    }

    if (cleaned.length < 2) {
      return [];
    }

    // 4. smoothing (EMA on lat/lon only)
    const alpha = 0.25;

    const smoothed: AppPathDataPoint[] = [];
    let prev = cleaned[0];
    if (!prev) {
      return [];
    }
    smoothed.push({...prev, distance: 0});

    let totalDistance = 0;

    for (let i = 1; i < cleaned.length; i++) {
      const curr = cleaned[i];
      if (!curr) {
        continue;
      }

      const smoothPoint: AppPathDataPoint = {
        ...curr,
        latitude: alpha * curr.latitude + (1 - alpha) * prev.latitude,
        longitude: alpha * curr.longitude + (1 - alpha) * prev.longitude,
      };

      const dist = this.pathUtility.haversine(prev, smoothPoint);
      totalDistance += dist;

      smoothed.push({
        ...smoothPoint,
        distance: totalDistance,
      });

      prev = smoothPoint;
    }
    return smoothed;
  }
}
