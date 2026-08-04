import {EntryType} from '../../openapi-client';
import {OutdoorRunService} from '../OutdoorRunService/OutdoorRunService';
import {OutdoorWalkService} from '../OutdoorWalkService/OutdoorWalkService';
import {RoutedWorkout} from './types/RoutedWorkout';
import {RoutedWorkoutEntry} from './types/RoutedWorkoutEntry';


export class RoutedWorkoutService {
  constructor(private readonly outdoorRunService: OutdoorRunService, private readonly outdoorWalkService: OutdoorWalkService) {}

  deleteMap<T extends RoutedWorkoutEntry>(entry: T): T {
    const workout = this.getWorkout(entry);
    workout.geoData = null;
    return entry;
  }

  getWorkout(entry: RoutedWorkoutEntry): RoutedWorkout {
    if (entry.type === EntryType.OUTDOOR_RUN) {
      return entry.outdoorRun;
    }
    return entry.outdoorWalk;
  }

  setWorkout<T extends RoutedWorkoutEntry>(entry: T, workout: RoutedWorkout): T {
    if (entry.type === EntryType.OUTDOOR_RUN) {
      return {
        ...entry,
        outdoorRun: workout,
      };
    }
    return {
      ...entry,
      outdoorWalk: workout,
    };
  }

  async updateDistance<T extends RoutedWorkoutEntry>(entry: T, value: number): Promise<T> {
    const workout = this.getWorkout(entry);
    workout.distance = value;
    const newEntry = await this.normalizeEntry(entry, false);
    return newEntry;
  }

  async normalizeEntry<T extends RoutedWorkoutEntry>(entry: T, normalizePath: boolean = true): Promise<T> {
    if (entry.type === EntryType.OUTDOOR_RUN) {
      const run = await this.outdoorRunService.normalizeEntry(entry.outdoorRun, normalizePath);
      return this.setWorkout(entry, run);
    }
    return this.setWorkout(entry, await this.outdoorWalkService.normalizeEntry(entry.outdoorWalk, normalizePath));
  }

}
