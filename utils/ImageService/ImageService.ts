import {schema} from '../../db/schema';
import {Image, ImageType, ImageUpsertDto} from '../../openapi-client';
import {AppImage} from '../../types/models/AppImage';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';

export class ImageService {
  protected logger: Logger = new Logger(ImageService.name);

  constructor(private readonly api: ApiService, private readonly db: DrizzleDb) {
    this.logger = new Logger(ImageService.name);
  }

  getImageUrl(image: AppImage | null) {
    if (!image) {
      return null;
    }
    if (image.image) {
      return `data:image/jpeg;base64,${image.image}`;
    }
    return image.url;
  }

  createImageUpsertDto(image: AppImage | null): ImageUpsertDto | undefined | null {
    if (!image) {
      return null;
    }
    if (!image.image) {
      return undefined;
    }
    const dto: ImageUpsertDto = {
      data: image.image,
    };
    return dto;
  }

  async createImage(userId: number, image: string, type: ImageType, trx: DrizzleDb): Promise<AppImage> {
    const newImage: typeof schema.images.$inferInsert = {
      userId: userId,
      image: image,
      type: type,
    };
    const imageRows = await trx.insert(schema.images).values(newImage).returning();
    let imageRow = imageRows[0];
    if (!imageRow) {
      throw new Error('Failed to insert image');
    }
    const result: AppImage = {
      id: imageRow.id,
      userId: imageRow.userId,
      image: imageRow.image,
      type: imageRow.type,
      url: null,
    };
    return result;
  }
  async processPulledItems(userId: number, db: DrizzleDb, images: [string, Image][], type: ImageType): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (images.length === 0) {
      return map;
    }
    const items = images.map(([, image]) => {
      const row: typeof schema.images.$inferInsert = {
        // externalId: image.id,
        userId: userId,
        url: image.url,
        image: null,
        type: type,
        // lastPulledAt: new Date(),
        // lastPushedAt: new Date(),
      };
      return row;
    });
    const rows = await db.insert(schema.images).values(items).onConflictDoUpdate({
      target: schema.images.id,
      set: conflictUpdateSetAllColumns(schema.images),
    }).returning();

    for (const [index, row] of rows.entries()) {
      const input = images[index];
      if (!input) {
        throw new Error('Entry id was lost. This should never happen');
      }
      const entryId = input[0];
      map.set(entryId, row.id);
    }
    return map;
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.images);
    return true;
  }

  async loadMap(imageIds: number[]): Promise<Map<number, AppImage>> {
    if (imageIds.length === 0) {
      return new Map();
    }
    const images = await this.db.query.images.findMany({
      where: (t, op) => op.inArray(t.id, imageIds),
    });
    return new Map(images.map((x) => [x.id, x]));

  }
}
