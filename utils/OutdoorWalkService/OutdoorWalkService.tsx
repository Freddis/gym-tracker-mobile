import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {OutdoorWalk} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {QuantitySampleTyped, WorkoutActivityType, WorkoutProxyTyped, WorkoutRouteLocation} from '@kingstinct/react-native-healthkit';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';
import {AppOutdoorWalk} from '../../types/models/AppOutdoorWalk';
import {batch} from '../batch';

export class OutdoorWalkService {
  protected logger: Logger;

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(OutdoorWalkService.name);
  }

  async deleteById(id: number, db: DrizzleDb): Promise<void> {
    await db.delete(schema.outdoorWalkGeoData).where(eq(schema.outdoorWalkGeoData.outdoorWalkId, id));
    await db.delete(schema.outdoorWalkHeartrateData).where(eq(schema.outdoorWalkHeartrateData.outdoorWalkId, id));
    await db.delete(schema.outdoorWalks).where(eq(schema.outdoorWalks.id, id));
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

  async processedPulledItems(db: DrizzleDb, items: OutdoorWalk[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (items.length === 0) {
      return map;
    }
    const input = items.map((item) => {
      const row: typeof schema.outdoorWalks.$inferInsert = {
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
      return row;
    });
    const rows = await db.insert(schema.outdoorWalks).values(input).onConflictDoUpdate({
      target: schema.outdoorWalks.externalId,
      set: conflictUpdateSetAllColumns(schema.outdoorWalks),
    }).returning();
    for (const row of rows) {
      if (!row.externalId) {
        throw new Error('External id was lost. This should never happen');
      }
      map.set(row.externalId, row.id);
    }
    for (const item of items) {
      const outdoorWalkId = map.get(item.id);
      if (!outdoorWalkId) {
        throw new Error('Outdoor walk id not found. This should never happen');
      }
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
}
