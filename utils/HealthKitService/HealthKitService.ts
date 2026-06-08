import {
  AuthorizationRequestStatus,
  getRequestStatusForAuthorization,
  queryQuantitySamples,
  queryWorkoutSamples,
  requestAuthorization,
  WorkoutActivityType,
  WorkoutProxyTyped,
} from '@kingstinct/react-native-healthkit';
import {EntryService} from '../EntryService/EntryService';
import {AuthUser} from '../../components/providers/AuthProvider/types/AuthUser';
import {Platform} from 'react-native';
import {AppEntry} from '../../types/models/AppEntry';

export class HealthKitService {
  protected entryService: EntryService;
  constructor(entryService: EntryService) {
    this.entryService = entryService;
  }

  async requestAuthorization(): Promise<boolean> {
    return await requestAuthorization({
      toRead: [
        'HKWorkoutTypeIdentifier',
        'HKWorkoutRouteTypeIdentifier',
        'HKQuantityTypeIdentifierHeartRate',
      ],
    });
  }

  async importFromHealhkitIfPossible(user: AuthUser) {
    if (Platform.OS === 'android') {
      return;
    }
    const status = await getRequestStatusForAuthorization({toRead: [
      'HKWorkoutTypeIdentifier',
      'HKWorkoutRouteTypeIdentifier',
      'HKQuantityTypeIdentifierHeartRate',
    ]});
    const authorizationPreviouslyHandled = status === AuthorizationRequestStatus.unnecessary;
    if (!authorizationPreviouslyHandled) {
      return;
    }
    try {
      await this.importFromHealthKit(user);
    } catch (error: unknown) {
      console.error('Error importing from HealthKit', error);
      return;
    }
  }

  async reImport<T extends AppEntry>(authUser: AuthUser, entry: T): Promise<AppEntry & { type: T['type'] }> {
    const id = entry.healthkitId;
    if (!id) {
      return entry;
    }
    const workouts = await queryWorkoutSamples({
      limit: 1,
      filter: {
        AND: [
          {
            uuid: id,
          },
        ],
      },
      ascending: false,
    });
    const workout = workouts[0];
    if (!workout) {
      throw new Error('Workout not found');
    }
    const hr = await this.getHeartRateForWorkout(workout);
    await this.entryService.importFromHealthKit(authUser, workout, hr, false);
    const updatedEntry = await this.entryService.getEntry(entry.id, entry.type);
    if (!updatedEntry) {
      throw new Error('Entry not found');
    }
    return updatedEntry;
  }

  async getWorkouts(limit: number = 0) {
    const workouts = await queryWorkoutSamples({
      limit: limit,
      filter: {
        OR: [
          {
            workoutActivityType: WorkoutActivityType.running,
          },
          {
            workoutActivityType: WorkoutActivityType.walking,
          },
        ],
      },
      ascending: false,
    });
    return workouts;
  }

  async getHeartRateForWorkout(workout: WorkoutProxyTyped) {
    const hr = await queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', {
      limit: 0,
      filter: {
        workout: workout,
      },
      ascending: true,
    });
    return hr;
  }

  async importFromHealthKit(user: AuthUser) {
    const workouts = await this.getWorkouts(10);
    for (const workout of workouts) {
      const hr = await this.getHeartRateForWorkout(workout);
      await this.entryService.importFromHealthKit(user, workout, hr);
    }
  }

}
