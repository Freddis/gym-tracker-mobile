import {schema} from '../../db/schema';
import {Image, ImageType, ImageUpsertDto} from '../../openapi-client';
import {AppImage} from '../../types/models/AppImage';
import {ApiService} from '../ApiService/ApiService';
import {conflictUpdateSetAllColumns, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import uuid from 'react-native-uuid';

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

  toImageUpsertDto(image: AppImage): ImageUpsertDto {
    const dto: ImageUpsertDto = {
      id: image.id,
      data: image.image ?? undefined,
    };
    return dto;

  }

  createImageUpsertDto(image: AppImage | null): ImageUpsertDto | undefined | null {
    if (!image) {
      return null;
    }
    if (!image.image) {
      return undefined;
    }
    return this.toImageUpsertDto(image);
  }

  async createImage(userId: number, image: string, type: ImageType, trx: DrizzleDb): Promise<AppImage> {
    const newImage: typeof schema.images.$inferInsert = {
      id: uuid.v4(),
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
  async processPulledItems(userId: number, db: DrizzleDb, images: [string, Image][], type: ImageType): Promise<Map<string, string>> {
    const map = new Map(images.map(([entityId, image]) => [entityId, image.id]));
    if (images.length === 0) {
      return map;
    }
    await this.upsertImages(userId, db, images.map(([, image]) => image), type);
    return map;
  }

  async upsertImages(userId: number, db: DrizzleDb, images: Image[], type: ImageType): Promise<void> {
    const uniqueImages = Array.from(new Map(images.map((image) => [image.id, image])).values());
    if (uniqueImages.length === 0) {
      return;
    }
    const items = uniqueImages.map((image) => {
      const row: typeof schema.images.$inferInsert = {
        id: image.id,
        userId: userId,
        url: image.url,
        image: null,
        type: type,
      };
      return row;
    });
    await db.insert(schema.images).values(items).onConflictDoUpdate({
      target: schema.images.id,
      set: conflictUpdateSetAllColumns(schema.images),
    });
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.images);
    return true;
  }

  async loadMap(imageIds: string[], trx?: DrizzleDb): Promise<Map<string, AppImage>> {
    if (imageIds.length === 0) {
      return new Map();
    }
    trx = trx ?? this.db;
    const images = await trx.query.images.findMany({
      where: (t, op) => op.inArray(t.id, imageIds),
    });
    return new Map(images.map((x) => [x.id, x]));

  }
}
