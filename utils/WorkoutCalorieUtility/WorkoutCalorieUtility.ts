import {PathUtility} from '../PathUtility/PathUtility';
import {WeightService} from '../WeightService/WeightService';
import {ActivityType} from './types/ActivityType';


export class WorkoutCalorieUtility {
  protected pathUtility: PathUtility;
  protected metMap: Record<ActivityType, number> = {
    [ActivityType.Walking]: 3.0,
    [ActivityType.Running]: 8.3,
    [ActivityType.Cycling]: 7.5,
    [ActivityType.Swimming]: 6.0,
    [ActivityType.Hiking]: 6.0,
    [ActivityType.StrengthTraining]: 5.0,
    [ActivityType.Yoga]: 2.5,
    [ActivityType.HIIT]: 8.0,
    [ActivityType.Elliptical]: 5.5,
    [ActivityType.Rowing]: 7.0,
  };

  constructor(private readonly weightService: WeightService) {
    this.pathUtility = new PathUtility();
  }

  async calculateCaloriesWithUser(
    activity: ActivityType,
    start: Date,
    durationSec: number,
    userId: number,
    distanceMeters: number | null = null
  ): Promise<number> {
    const weightRecord = await this.weightService.getLastWeight(userId, start);
    const weightKg = weightRecord?.weight?.weight ?? 70;
    return this.calculateCaloriesWithWeight(activity, durationSec, weightKg, distanceMeters);
  }


  calculateCaloriesWithWeight(
    activity: ActivityType,
    durationSec: number,
    weightKg: number,
    distanceMeters: number | null = null
  ): number {
    const hours = durationSec / 3600;
    let met = this.metMap[activity];

    // activity-specific refinements
    if (distanceMeters && durationSec > 0) {
      const speedKmh = (distanceMeters / durationSec) * 3.6;
      const speedMPerMin = distanceMeters / (durationSec / 60);

      switch (activity) {
        case ActivityType.Walking: {
          // ACSM walking approximation
          met = 1 + speedMPerMin / 35;
          break;
        }

        case ActivityType.Running: {
          // ACSM running approximation
          met = 1 + speedMPerMin / 17.5;
          break;
        }

        case ActivityType.Cycling: {
          // Simple speed-based cycling MET buckets
          if (speedKmh < 16) met = 4.0;
          else if (speedKmh < 19) met = 6.0;
          else if (speedKmh < 22.5) met = 8.0;
          else if (speedKmh < 25.5) met = 10.0;
          else if (speedKmh < 30.5) met = 12.0;
          else met = 16.0;
          break;
        }

        case ActivityType.Swimming: {
          // Pace-based swimming MET buckets
          // speedMPerMin = meters per minute
          if (speedMPerMin < 20) met = 6.0;       // easy / relaxed laps
          else if (speedMPerMin < 30) met = 8.0;  // moderate lap swimming
          else if (speedMPerMin < 40) met = 10.0; // vigorous swimming
          else met = 11.0;                        // very vigorous / training pace
          break;
        }

        default:
          break;
      }
    }

    return met * weightKg * hours;
  }

}
