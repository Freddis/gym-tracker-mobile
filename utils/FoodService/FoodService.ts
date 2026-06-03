import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {Food, FoodUpsertDto, Image, ImageType} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {asyncDrizzle, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {ISyncedEntityService} from '../SyncService/types/ISyncedEntityService';
import {StageProgressCallback} from '../SyncService/types/StageProgressCallback';
import {ImageService} from '../ImageService/ImageService';
import {avoidLet} from '../avoidLet';
import {AppImage} from '../../types/models/AppImage';
import {AppFood} from './types/AppFood';
import {AppFoodComponent} from './types/AppFoodComponent';
import {transactionAsync} from '../runTransaction';
export interface FoodFilter {
  ids?: string[];
  search?: string;
  isDish?: boolean;
  personalLibrary?: boolean;
  includeDeleted?: boolean;
}
export class FoodService implements ISyncedEntityService {
  protected logger: Logger;
  private readonly db: DrizzleDb;
  private readonly api: ApiService;
  private readonly imageService: ImageService;

  constructor(api: ApiService, db: DrizzleDb, imageService: ImageService) {
    this.logger = new Logger(FoodService.name);
    this.db = db;
    this.api = api;
    this.imageService = imageService;
  }

  async loadFood(ids: Set<string>): Promise<Map<string, AppFood>> {
    if (ids.size === 0) {
      return new Map();
    }
    const foodRows = await this.db.query.food.findMany({
      where: (t, op) => op.inArray(t.id, Array.from(ids)),
      with: {
        image: true,
        components: true,
      },
    });
    const componentIds: Set<string> = foodRows.flatMap((x) => x.components).reduce((acc, x) => acc.add(x.componentId), new Set<string>());
    const components = await this.loadFood(componentIds);
    const foodArray = foodRows.map((x) => {
      const image: AppImage | null = avoidLet(() => {
        if (!x.image) {
          return null;
        }
        const url = x.image.url ?? x.image.image;
        if (!url) {
          return null;
        }
        return {
          id: x.image.id,
          url: url,
          userId: x.userId,
          image: x.image.image,
          type: ImageType.FOOD,
        };
      });
      const food: AppFood = {
        id: x.id,
        name: x.name,
        description: x.description,
        protein: x.protein,
        carbs: x.carbs,
        fat: x.fat,
        servingSize: x.servingSize,
        servingSizeUnit: x.servingSizeUnit,
        isMeal: x.isMeal,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
        deletedAt: x.deletedAt,
        lastPushedAt: x.lastPushedAt,
        lastPulledAt: x.lastPulledAt,
        image: image,
        calories: x.protein * 4 + x.carbs * 4 + x.fat * 9,
        components: x.components.map((x) => {
          const food = components.get(x.componentId);
          if (!food) {
            throw new Error(`Food component ${x.componentId} not found`);
          }
          const component: AppFoodComponent = {
            amount: x.amount,
            unit: x.unit,
            food: food,
          };
          return component;
        }),
      };
      return food;
    });
    return new Map(foodArray.map((x) => [x.id, x]));
  }

  async deleteFood(id: string) {
    await this.db.update(schema.food).set({
      deletedAt: new Date(),
    }).where(eq(schema.food.id, id));
  }

  async createFood(userId: number, food: AppFood, image?: string | null): Promise<AppFood> {
    return this.updateFood(userId, food, image);
  }

  async updateFood(userId: number, food: AppFood, image?: string | null): Promise<AppFood> {
    const db = await asyncDrizzle();
    const result = await transactionAsync(db, async (trx) => {
      const appImage = image ? await this.imageService.createImage(userId, image, ImageType.FOOD, trx) : null;
      const imageMap: Map<string, number> = appImage ? new Map([[food.id, appImage.id]]) : new Map();
      await this.upsertFood(trx, userId, [food], imageMap);
      return {
        ...food,
        image: image !== undefined ? appImage : food.image,
      };
    });
    return result;
  }

  async getFood(query?: FoodFilter): Promise<AppFood[]> {
    if (query?.personalLibrary === false) {
      return [];
    }
    const foodRows = await this.db.query.food.findMany({
      where: (t, op) => op.and(
        query?.search ? op.like(t.name, `%${query.search}%`) : undefined,
        query?.includeDeleted ? undefined : op.isNull(t.deletedAt),
        query?.ids ? op.inArray(t.id, query.ids) : undefined,
      ),
      orderBy: (t, op) => [op.desc(t.createdAt)],
    });

    const foodMap = await this.loadFood(new Set(foodRows.map((x) => x.id)));
    const reordered:AppFood[] = [];
    for (const x of foodRows) {
      const food = foodMap.get(x.id);
      if (!food) {
        throw new Error(`Food ${x.id} not found`);
      }
      reordered.push(food);
    }
    return reordered;

  }

  async pullFromServer(userId: number, trx: DrizzleDb = this.db, progress: StageProgressCallback = () => {}): Promise<boolean> {
    const lastUpdateFromServer = await this.getLatestPullSyncDate(trx);
    let page = 1;
    let processedItems = 0;

    const collectedItems: Food[] = [];
    while (true) {
      const response = await this.api.client().getFoodList({
        query: {
          updatedAfter: lastUpdateFromServer ?? undefined,
          includeDeleted: true,
          page: page++,
        },
        timeout: 10000,
      });
      if (response.error) {
        return false;
      }
      progress({itemsDone: processedItems, itemsNumber: response.data.info.count});
      processedItems += response.data.items.length;
      collectedItems.push(...response.data.items);
      if (response.data.items.length < response.data.info.pageSize) {
        break;
      }
    }
    await this.processedPulledItems(trx, userId, collectedItems);
    return true;
  }

  async processedPulledItems(trx: DrizzleDb, userId: number, items: Food[]) {
    console.log('Processing images');
    const images = items.map((x) => {
      if (!x.image) {
        return null;
      }
      const image: [string, Image] = [x.id, x.image];
      return image;
    }).filter((x) => x !== null);
    const imageMap = await this.imageService.processPulledItems(userId, trx, images, ImageType.FOOD);


    const foodToAppFood = (food: Food): AppFood => {
      return {
        ...food,
        lastPushedAt: new Date(),
        lastPulledAt: new Date(),
        image: null,
        components: food.components.map((x) => {
          return {
            ...x,
            food: foodToAppFood(x.food),
          };
        }),
      };
    };
    await this.upsertFood(trx, userId, items.map(foodToAppFood), imageMap);
  }

  //todo: refactor this: remove imageMap and simply use AppFood[]
  async upsertFood(trx: DrizzleDb, userId: number, items: AppFood[], imageMap: Map<string, number>) {
    for (const item of items) {
      const imageId = imageMap.get(item.id);
      const row: typeof schema.food.$inferInsert = {
        id: item.id,
        name: item.name,
        description: item.description,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        servingSize: item.servingSize,
        servingSizeUnit: item.servingSizeUnit,
        isMeal: item.isMeal,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        deletedAt: item.deletedAt,
        lastPulledAt: item.lastPulledAt,
        lastPushedAt: item.lastPushedAt,
        userId: userId,
        imageId: imageId,
      };
      const existing = await trx.query.food.findFirst({
        where: (t, op) => op.eq(t.id, item.id),
      });
      if (existing) {
        const lastUpdateStampOwn = Math.max(existing.createdAt.getTime(), existing.updatedAt?.getTime() ?? 0, existing.deletedAt?.getTime() ?? 0);
        const lastUpdateStampServer = Math.max(item.createdAt.getTime(), item.updatedAt?.getTime() ?? 0, item.deletedAt?.getTime() ?? 0);
        if (lastUpdateStampOwn >= lastUpdateStampServer) {
          continue;
        }
        await trx.update(schema.food).set(row).where(eq(schema.food.id, item.id));
      } else {
        await trx.insert(schema.food).values(row).returning();
      }
    }
    for (const item of items) {
      await trx.delete(schema.foodComponents).where(eq(schema.foodComponents.foodId, item.id));
      for (const component of item.components) {
        await trx.insert(schema.foodComponents).values({
          foodId: item.id,
          componentId: component.food.id,
          amount: component.amount,
          unit: component.unit,
        });
      }
    }
  }

  async getLatestPullSyncDate(trx: DrizzleDb): Promise<Date | null> {
    const row = await trx.query.food.findFirst({
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

  protected async getLatestPushSyncDate(db: DrizzleDb): Promise<Date | null> {
    const row = await db.query.food.findFirst({
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

  async pushToServer(userId: number, trx: DrizzleDb = this.db): Promise<boolean> {
    this.logger.info('Pushing food to server', {userId});
    const lastPullSyncDate = await this.getLatestPushSyncDate(trx);
    this.logger.info('Last pull sync date', {lastPullSyncDate});
    const idRows = await trx.query.food.findMany({
      columns: {
        id: true,
      },
      where: (t, op) => op.and(
        eq(t.userId, userId),
        lastPullSyncDate ? op.or(
          op.gt(t.updatedAt, lastPullSyncDate),
          op.gt(t.createdAt, lastPullSyncDate),
          op.gt(t.deletedAt, lastPullSyncDate),
          op.isNull(t.lastPushedAt),
        ) : undefined
      ),
    });
    if (idRows.length === 0) {
      this.logger.info('No food to push');
      return true;
    }
    return await this.pushFood(trx, idRows.map((x) => x.id));
  }
  protected async pushFood(db: DrizzleDb, ids: string[]): Promise<boolean> {
    this.logger.info('Getting entries to upsert', {ids: ids});
    const entriesToUpsert: AppFood[] = await this.getFood({
      ids: ids,
      includeDeleted: true,
    });
    const data: FoodUpsertDto[] = entriesToUpsert.map((x) => this.createUpsertDto(x));
    console.log('Sending entries to server', data);
    const response = await this.api.client().upsertFoods({
      body: data,
    });

    if (response.error) {
      return false;
    }
    for (const [i, entry] of response.data.entries()) {
      if (!entriesToUpsert[i]) {
        throw new Error('Matching upserted entity not found');
      }
      await db.update(schema.food).set({
        lastPushedAt: new Date(),
        // remoteId: entry.id,
      }).where(
        eq(schema.food.id, entriesToUpsert[i].id)
      );
      // update image url if it was changed
      if (entriesToUpsert[i].image && entry.image) {
        await db.update(schema.images).set({
          url: entry.image.url,
          image: null,
        }).where(
          eq(schema.images.id, entriesToUpsert[i].image.id)
        );
      }
    }
    return true;
  }

  protected createUpsertDto(food: AppFood): FoodUpsertDto {
    const imageDto = this.imageService.createImageUpsertDto(food.image);
    return {
      ...food,
      image: imageDto,
    };
  }

  async wipeLocalData(userId: number, trx: DrizzleDb): Promise<boolean> {
    await trx.delete(schema.foodComponents);
    await trx.delete(schema.food);
    return true;
  }
}
