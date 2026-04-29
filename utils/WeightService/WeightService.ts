import {schema} from '../../db/schema';
import {Weight} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';

export class WeightService {
  protected logger: Logger;

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(WeightService.name);
  }

  async processedPulledItems(db: DrizzleDb, weights: Weight[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (weights.length === 0) {
      return map;
    }
    const items = weights.map((weight) => {
      const row: typeof schema.weight.$inferInsert = {
        externalId: weight.id,
        userId: weight.userId,
        weight: weight.weight,
        units: weight.units,
        createdAt: weight.createdAt,
        updatedAt: weight.updatedAt,
        deletedAt: weight.deletedAt,
      };
      return row;
    });
    const rows = await db.insert(schema.weight).values(items).onConflictDoUpdate({
      target: schema.weight.externalId,
      set: conflictUpdateSetAllColumns(schema.weight),
    }).returning();
    for (const row of rows) {
      if (!row.externalId) {
        throw new Error('External id was lost. This should never happen');
      }
      map.set(row.externalId, row.id);
    }
    return map;
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.weight);
    return true;
  }
}
