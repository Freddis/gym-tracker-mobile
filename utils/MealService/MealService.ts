import {eq} from 'drizzle-orm';
import {schema} from '../../db/schema';
import {Entry, EntryType, Meal, MealEntryUpsertDto, PostEntryUpsertDto} from '../../openapi-client';
import {IEntryService} from '../../types/IEntryService';
import {BaseEntry, MealAppEntry} from '../../types/models/AppEntry';
import {asyncDrizzle, DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {AppMeal} from './types/AppMeal';
import {FoodService} from '../FoodService/FoodService';
import {AppFoodComponent} from '../FoodService/types/AppFoodComponent';
import {transactionAsync} from '../runTransaction';
import {EntryRepositoryService} from '../EntryRepositoryService/EntryRepositoryService';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';

export class MealService implements IEntryService<EntryType.MEAL> {
  protected logger: Logger;
  protected readonly foodService: FoodService;
  protected readonly db: DrizzleDb;
  protected readonly entryRepositoryService: EntryRepositoryService;

  constructor(db: DrizzleDb, foodService: FoodService, entryRepositoryService: EntryRepositoryService) {
    this.db = db;
    this.foodService = foodService;
    this.logger = new Logger(MealService.name);
    this.entryRepositoryService = entryRepositoryService;
  }

  async create(meal: AppMeal, db: DrizzleDb): Promise<number> {
    const newMealRow: typeof schema.meals.$inferInsert = {
      type: meal.type,
    };
    const rows = await db.insert(schema.meals).values(newMealRow).returning({
      id: schema.meals.id,
    });
    const row = rows[0];
    if (!row) {
      throw new Error('Meal not found');
    }
    const newMealFoodRows: typeof schema.mealFoodComponents.$inferInsert[] = meal.food.map((food) => ({
      mealId: row.id,
      foodId: food.food.id,
      amount: food.amount,
      unit: food.unit,
    }));
    if (newMealFoodRows.length === 0) {
      return row.id;
    }
    await db.insert(schema.mealFoodComponents).values(newMealFoodRows);
    return row.id;
  }

  async update(entry: MealAppEntry, db: DrizzleDb): Promise<void> {
    await db.update(schema.meals).set({
      type: entry.meal.type,
    })
    .where(
      eq(schema.meals.id, entry.meal.id)
    );
    await db.delete(schema.mealFoodComponents).where(eq(schema.mealFoodComponents.mealId, entry.meal.id));
    const newMealFoodRows: typeof schema.mealFoodComponents.$inferInsert[] = entry.meal.food.map((food) => ({
      mealId: entry.meal.id,
      foodId: food.food.id,
      amount: food.amount,
      unit: food.unit,
    }));
    if (newMealFoodRows.length === 0) {
      return;
    }
    await db.insert(schema.mealFoodComponents).values(newMealFoodRows);
  }

  async copy(entry: MealAppEntry, user: AuthUser) {
    //todo: need to make image copy as well, but first need to finish the endpoint for that and switch to uuid.
    const db = await asyncDrizzle();
    const copy = await transactionAsync(db, async (trx) => {
      const newMeal: AppMeal = {
        ...entry.meal,
      };
      const mealId = await this.create(newMeal, trx);
      const newEntry = await this.entryRepositoryService.create(trx, user, EntryType.MEAL, 'mealId', mealId, {
        time: new Date(),
      });
      return this.construct(newEntry, {
        ...newMeal,
        id: mealId,
      });
    });
    return copy;
  }

  getObject(entry: Entry): Meal | null {
    return entry.meal ?? null;
  }

  getUpsertDto(entry: MealAppEntry, dto: PostEntryUpsertDto): MealEntryUpsertDto {
    return {
      ...dto,
      type: EntryType.MEAL,
      meal: {
        ...entry.meal,
      },
    };
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.mealFoodComponents);
    await db.delete(schema.meals);
    return true;
  }

  async deleteById(id: number, db: DrizzleDb): Promise<void> {
    await db.delete(schema.mealFoodComponents).where(eq(schema.mealFoodComponents.mealId, id));
    await db.delete(schema.meals).where(eq(schema.meals.id, id));
  }

  async processPulledItems(db: DrizzleDb, items: [string, Meal][]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    for (const [id, item] of items) {
      const newMealRow: typeof schema.meals.$inferInsert = {
        type: item.type,
      };
      const rows = await db.insert(schema.meals).values(newMealRow).returning({
        id: schema.meals.id,
      });
      const row = rows[0];
      if (!row) {
        throw new Error('Meal not found');
      }
      map.set(id, row.id);
      if (item.food.length === 0) {
        continue;
      }
      const newMealFoodRows: typeof schema.mealFoodComponents.$inferInsert[] = item.food.map((food) => ({
        mealId: row.id,
        foodId: food.food.id,
        amount: food.amount,
        unit: food.unit,
      }));
      await db.insert(schema.mealFoodComponents).values(newMealFoodRows);

    }
    return map;
  }

  async loadMap(ids: number[]): Promise<Map<number, AppMeal>> {
    const rows = await this.db.query.meals.findMany({
      where: (t, op) => op.inArray(t.id, ids),
      with: {
        food: true,
      },
    });
    const foodIds = rows.flatMap((x) => x.food.map((x) => x.foodId));
    const foodMap = await this.foodService.loadFood(new Set(foodIds));
    const result: AppMeal[] = rows.map((x) => {
      const meal: AppMeal = {
        id: x.id,
        type: x.type,
        food: x.food.map((y) => {
          const food = foodMap.get(y.foodId);
          if (!food) {
            throw new Error(`Food ${y.foodId} not found`);
          }
          const component: AppFoodComponent = {
            food: food,
            amount: y.amount,
            unit: y.unit,
          };
          return component;
        }),
      };
      return meal;
    });
    return new Map(result.map((x) => [x.id, x]));
  }

  construct(row: BaseEntry, value: AppMeal): MealAppEntry {
    return {
      ...row,
      type: EntryType.MEAL,
      meal: value,
    };
  }

}
