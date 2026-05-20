import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {Food, FoodComponent, Image, ImageType} from '../../openapi-client';
import {ApiService} from '../ApiService/ApiService';
import {DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {ISyncedEntityService} from '../SyncService/types/ISyncedEntityService';
import {StageProgressCallback} from '../SyncService/types/StageProgressCallback';
import {ImageService} from '../ImageService/ImageService';
import {avoidLet} from '../avoidLet';


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

  async loadFood(ids: Set<string>): Promise<Map<string, Food>> {
    if (ids.size === 0) {
      return new Map<string, Food>();
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
      const image: Image | null = avoidLet(() => {
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
        };
      });
      const food: Food = {
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
        image: image,
        calories: x.protein * 4 + x.carbs * 4 + x.fat * 9,
        components: x.components.map((x) => {
          const food = components.get(x.componentId);
          if (!food) {
            throw new Error(`Food component ${x.componentId} not found`);
          }
          const component: FoodComponent = {
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

  async getFood(): Promise<Food[]> {
    const foodRows = await this.db.query.food.findMany({
      orderBy: (t, op) => [op.desc(t.createdAt)],
    });

    const foodMap = await this.loadFood(new Set(foodRows.map((x) => x.id)));
    const reordered:Food[] = [];
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await this.api.client().getFoodList({
        query: {
          updatedAfter: lastUpdateFromServer ?? undefined,
          includeDeleted: true,
          page: page++,
        },
      });
      if (response.error) {
        return false;
      }
      progress({itemsDone: processedItems, itemsNumber: response.data.info.count});
      processedItems += response.data.items.length;
      await this.processedPulledItems(trx, userId, response.data.items);
      if (response.data.items.length < response.data.info.pageSize) {
        return true;
      }
    }
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
    const imageMap = await this.imageService.processedPulledItems(userId, trx, images, ImageType.FOOD);
    console.log('Processing food');
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
        lastPulledAt: new Date(),
        lastPushedAt: new Date(),
        userId: userId,
        imageId: imageId,
      };
      const existing = await trx.query.food.findFirst({
        where: (t, op) => op.eq(t.id, item.id),
      });
      if (existing) {
        await trx.update(schema.food).set(row).where(eq(schema.food.id, item.id));
      } else {
        await trx.insert(schema.food).values(row).returning();
      }
    }
    console.log('Processing food components');
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

  pushToServer(userId: number, trx: DrizzleDb = this.db): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async wipeLocalData(userId: number, trx: DrizzleDb): Promise<boolean> {
    await trx.delete(schema.foodComponents);
    await trx.delete(schema.food);
    return true;
  }
}
