import {IEntryService} from '../../types/IEntryService';
import {DrizzleDb} from '../drizzle';
import {Logger} from '../Logger/Logger';
import {CalorieGoal, Entry, EntryType, EntryUpsertDto, PostEntryUpsertDto} from '../../openapi-client';
import {BaseEntry, CalorieGoalAppEntry} from '../../types/models/AppEntry';
import {schema} from '../../db/schema';
import {eq} from 'drizzle-orm';
import {AppCalorieGoal} from './types/AppCalorieGoal';

export class CalorieGoalService implements IEntryService<EntryType.CALORIE_GOAL> {
  protected logger: Logger;
  constructor(private readonly db: DrizzleDb) {
    this.logger = new Logger(CalorieGoalService.name);
  }

  async create(calorieGoal: AppCalorieGoal, db: DrizzleDb): Promise<number> {
    throw new Error('Not implemented');
  }
  update(entry: CalorieGoalAppEntry & {type: EntryType.CALORIE_GOAL;}, db: DrizzleDb): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getObject(entry: Entry): CalorieGoal | null {
    return entry.calorieGoal ?? null;
  }

  getUpsertDto(entry: CalorieGoalAppEntry, dto: PostEntryUpsertDto): EntryUpsertDto {
    return {
      ...dto,
      type: EntryType.CALORIE_GOAL,
      calorieGoal: {
        ...entry.calorieGoal,
      },
    };
  }

  async wipeLocalData(db: DrizzleDb): Promise<boolean> {
    await db.delete(schema.calorieGoals);
    return true;
  }

  async deleteById(id: number, db: DrizzleDb): Promise<void> {
    await db.delete(schema.calorieGoals).where(eq(schema.calorieGoals.id, id));
  }

  async processPulledItems(db: DrizzleDb, items: [string, CalorieGoal][]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    for (const [id, item] of items) {
      const newCalorieGoalRow: typeof schema.calorieGoals.$inferInsert = {
        calories: item.calories,
        carbs: item.carbs,
        protein: item.protein,
        fat: item.fat,
        start: item.start,
        end: item.end,
      };
      const rows = await db.insert(schema.calorieGoals).values(newCalorieGoalRow).returning({
        id: schema.calorieGoals.id,
      });
      const row = rows[0];
      if (!row) {
        throw new Error('Calorie goal not found');
      }
      map.set(id, row.id);
    }
    return map;
  }

  async loadMap(ids: number[]): Promise<Map<number, AppCalorieGoal>> {
    if (ids.length === 0) {
      return new Map();
    }
    const calorieGoals: AppCalorieGoal[] = await this.db.query.calorieGoals.findMany({
      where: (t, op) => op.inArray(t.id, ids),
    });
    return new Map(calorieGoals.map((x) => [x.id, x]));
  }

  construct(row: BaseEntry, value: AppCalorieGoal): CalorieGoalAppEntry {
    return {
      ...row,
      type: EntryType.CALORIE_GOAL,
      calorieGoal: value,
    };
  }
}
