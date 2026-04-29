import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {OutdoorRun} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {WorkoutProxyTyped, QuantitySampleTyped, WorkoutActivityType, WorkoutRouteLocation} from '@kingstinct/react-native-healthkit';
import {AppOutdoorRun} from '../../types/models/AppOutdoorRun';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';
import {batch} from '../batch';

export class OutdoorRunService {
  protected logger: Logger;

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(OutdoorRunService.name);
  }

  async deleteById(id: number, db: DrizzleDb): Promise<void> {
    await db.delete(schema.outdoorRunGeoData).where(eq(schema.outdoorRunGeoData.outdoorRunId, id));
    await db.delete(schema.outdoorRunHeartrateData).where(eq(schema.outdoorRunHeartrateData.outdoorRunId, id));
    await db.delete(schema.outdoorRuns).where(eq(schema.outdoorRuns.id, id));
  }

  async processedPulledItems(db: DrizzleDb, items: OutdoorRun[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (items.length === 0) {
      return map;
    }
    const input = items.map((item) => {
      const row: typeof schema.outdoorRuns.$inferInsert = {
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
    const rows = await db.insert(schema.outdoorRuns).values(input).onConflictDoUpdate({
      target: schema.outdoorRuns.externalId,
      set: conflictUpdateSetAllColumns(schema.outdoorRuns),
    }).returning();
    for (const row of rows) {
      if (!row.externalId) {
        throw new Error('External id was lost. This should never happen');
      }
      map.set(row.externalId, row.id);
    }
    for (const item of items) {
      const outdoorRunId = map.get(item.id);
      if (!outdoorRunId) {
        throw new Error('Outdoor run id not found. This should never happen');
      }
      const geoData = item.geoData?.map((geoData) => {
        return {
          outdoorRunId: outdoorRunId,
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
      await db.delete(schema.outdoorRunGeoData).where(eq(schema.outdoorRunGeoData.outdoorRunId, outdoorRunId));
      if (geoData.length > 0) {
        // for (const geoDataItem of geoData) {
        //   await db.insert(schema.outdoorRunGeoData).values(geoDataItem);
        // }
        // await db.insert(schema.geoData).values(geoData);
        await batch(geoData, 200, async (batch) => {
          return await db.insert(schema.outdoorRunGeoData).values(batch).returning();
        });
      }
      const heartRateData: typeof schema.outdoorRunHeartrateData.$inferInsert[] = item.heartRateData?.map((heartRateData) => {
        return {
          outdoorRunId: outdoorRunId,
          timestamp: heartRateData.timestamp,
          heartRate: heartRateData.heartRate,
        };
      }) ?? [];
      await db.delete(schema.outdoorRunHeartrateData).where(eq(schema.outdoorRunHeartrateData.outdoorRunId, outdoorRunId));
      if (heartRateData.length > 0) {
        await batch(heartRateData, 300, async (batch) => {
          return await db.insert(schema.outdoorRunHeartrateData).values(batch).returning();
        });
      }
    }
    return map;
  }
  async import(
    user: AuthUser,
    workout: WorkoutProxyTyped,
    routes: WorkoutRouteLocation[],
    hr: readonly QuantitySampleTyped<'HKQuantityTypeIdentifierHeartRate'>[],
    db: DrizzleDb
  ): Promise<AppOutdoorRun> {
    if (workout.workoutActivityType !== WorkoutActivityType.running) {
      throw new Error('Workout activity type is not running');
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
    const outdoorRunRows = await db.insert(schema.outdoorRuns).values(row).returning();
    const outdoorRunRow = outdoorRunRows[0];
    if (!outdoorRunRow) {
      throw new Error('Outdoor walk row not found');
    }
    const pathData: typeof schema.outdoorRunGeoData.$inferInsert[] = routes.map((point) => {
      return {
        outdoorRunId: outdoorRunRow.id,
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
      //   await db.insert(schema.outdoorRunGeoData).values(pathDataItem);
      // }
    if (pathData.length > 0) {
      await batch(pathData, 200, async (batch) => {
        return await db.insert(schema.outdoorRunGeoData).values(batch).returning();
      });
    }
    const heartRateData: typeof schema.outdoorRunHeartrateData.$inferInsert[] = hr.map((hr) => {
      return {
        outdoorRunId: outdoorRunRow.id,
        timestamp: hr.startDate.getTime() - workout.startDate.getTime(),
        heartRate: hr.quantity,
      };
    });

    // for (const heartRateDataItem of heartRateData) {
    //   await db.insert(schema.outdoorRunHeartrateData).values(heartRateDataItem);
    // }
    if (heartRateData.length > 0) {
      await batch(heartRateData, 300, async (batch) => {
        return await db.insert(schema.outdoorRunHeartrateData).values(batch).returning();
      });
    }

    const result: AppOutdoorRun = {
      id: outdoorRunRow.id,
      externalId: outdoorRunRow.externalId,
      duration: outdoorRunRow.duration,
      userId: outdoorRunRow.userId,
      distance: outdoorRunRow.distance,
      pace: outdoorRunRow.pace,
      maxPace: outdoorRunRow.maxPace,
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
      cadence: outdoorRunRow.cadence,
      maxCadence: outdoorRunRow.maxCadence,
      elevationGain: null,
      heartRate: outdoorRunRow.heartRate,
      maxHeartRate: outdoorRunRow.maxHeartRate,
      calories: outdoorRunRow.calories,
      start: outdoorRunRow.start,
      end: outdoorRunRow.end,
    };
    return result;
  }
  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.outdoorRunGeoData);
    await db.delete(schema.outdoorRunHeartrateData);
    await db.delete(schema.outdoorRuns);
    return true;
  }
}
