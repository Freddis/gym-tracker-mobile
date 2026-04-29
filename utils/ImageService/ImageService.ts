import {schema} from '../../db/schema';
import {Image} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';

export class ImageService {
  protected logger: Logger = new Logger(ImageService.name);

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(ImageService.name);
  }

  async processedPulledItems(db: DrizzleDb, images: Image[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (images.length === 0) {
      return map;
    }
    const items = images.map((image) => {
      const row: typeof schema.images.$inferInsert = {
        externalId: image.id,
        userId: image.userId ?? 0,
        url: image.url,
        image: null,
        type: image.imageType,
        lastPulledAt: new Date(),
        lastPushedAt: new Date(),
      };
      return row;
    });
    const rows = await db.insert(schema.images).values(items).onConflictDoUpdate({
      target: schema.images.externalId,
      set: conflictUpdateSetAllColumns(schema.images),
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
    await db.delete(schema.images);
    return true;
  }
}
