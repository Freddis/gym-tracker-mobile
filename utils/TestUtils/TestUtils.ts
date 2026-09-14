import {ApiService} from '../ApiService/ApiService';
import {db, DrizzleDb} from '../drizzle';
import {EntryRepositoryService} from '../EntryRepositoryService/EntryRepositoryService';
import {ExerciseService} from '../ExerciseService/ExerciseService';
import {ImageService} from '../ImageService/ImageService';
import {WorkoutService} from '../WorkoutService/WorkoutService';

export class TestUtils {

  static getDb(): DrizzleDb {
    return db;
  }

  static getWorkoutService(): WorkoutService {
    const imageService = new ImageService(new ApiService(), this.getDb());
    return new WorkoutService(
      this.getDb(),
      new EntryRepositoryService(imageService),
      new ExerciseService(this.getDb(), imageService));
  }
}
