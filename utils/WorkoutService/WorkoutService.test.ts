import {AppWorkout} from "@/types/models/AppWorkout";
import {useDrizzle} from "../drizzle";
import {NewModel} from "@/types/NewModel";
import {migrate} from "drizzle-orm/expo-sqlite/migrator";
import migrations from '../../db/migrations/migrations'
import {WorkoutService} from "./WorkoutService";

describe(WorkoutService.name, () => {
  test('Wipes workout data', async () => {
    // prepare
    const service = new WorkoutService();
    const [db,schema] = useDrizzle();
    await migrate(db,migrations)
    await db.delete(schema.workouts);
    const testWorkout: NewModel<AppWorkout> = {
      externalId: 123,
      typeId: null,
      userId: 0,
      calories: 0,
      start: new Date(),
      end: null,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      lastPulledAt: null,
      lastPushedAt: null
    }
    // pre-check
    await db.insert(schema.workouts).values(testWorkout);
    const workout = await db.query.workouts.findFirst();
    expect(workout?.externalId).toBe(123)

    // test
    await service.wipeLocalData(db);

    // check
    const anyWorkout = await db.query.workouts.findFirst();
    expect(anyWorkout).toBe(undefined)
  });
});