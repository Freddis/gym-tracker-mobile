import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {Entry, EntryType, EntryUpsertDto, PostEntryUpsertDto, Weight, WeightEntryUpsertDto} from '../../openapi-client';
import {IEntryService} from '../../types/IEntryService';
import {BaseEntry, WeightAppEntry} from '../../types/models/AppEntry';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {AppWeight} from '../../types/models/AppWeight';
export class WeightService implements IEntryService<EntryType.WEIGHT> {
  protected logger: Logger;

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(WeightService.name);
  }

  async loadMap(ids: number[]): Promise<Map<number, AppWeight>> {
    const weights: AppWeight[] = await this.db.query.weight.findMany({
      where: (t, op) => op.inArray(t.id, ids),
    });
    return new Map(weights.map((x) => [x.id, x]));
  }
  construct(row: BaseEntry, value: AppWeight): WeightAppEntry {
    return {
      ...row,
      type: EntryType.WEIGHT,
      weight: value,
    };
  }

  getObject(entry: Entry): Weight | null {
    return entry.weight ?? null;
  }

  getUpsertDto(entry: WeightAppEntry & {type: EntryType.WEIGHT;}, dto: PostEntryUpsertDto): EntryUpsertDto {
    const data: WeightEntryUpsertDto = {
      ...dto,
      type: 'Weight',
      weight: {
        ...entry.weight,
      },
    };
    return data;
  }

  async deleteById(id: number, db: DrizzleDb): Promise<void> {
    await db.delete(schema.weight).where(eq(schema.weight.id, id));
  }

  async processPulledItems(db: DrizzleDb, items: [string, Weight][]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (items.length === 0) {
      return map;
    }
    for (const [id, weight] of items) {
      const input: typeof schema.weight.$inferInsert = {
        externalId: weight.id,
        userId: weight.userId,
        weight: weight.weight,
        units: weight.units,
        createdAt: weight.createdAt,
        updatedAt: weight.updatedAt,
        deletedAt: weight.deletedAt,
      };

      const rows = await db.insert(schema.weight).values(input).onConflictDoUpdate({
        target: schema.weight.externalId,
        set: conflictUpdateSetAllColumns(schema.weight),
      }).returning();
      const row = rows[0];
      if (!row) {
        throw new Error('Weight not found');
      }
      map.set(id, row.id);
    }
    return map;
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.weight);
    return true;
  }
}
