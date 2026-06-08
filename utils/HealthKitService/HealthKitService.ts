import {
  AuthorizationRequestStatus,
  getRequestStatusForAuthorization,
  queryQuantitySamples,
  queryWorkoutSamples,
  WorkoutActivityType,
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
      limit: 10,
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
    const hr = await queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', {
      limit: 10,
      filter: {
        workout: workout,
      },
    });
    await this.entryService.importFromHealthKit(authUser, workout, hr, false);
    const updatedEntry = await this.entryService.getEntry(entry.id, entry.type);
    if (!updatedEntry) {
      throw new Error('Entry not found');
    }
    return updatedEntry;
  }

  async importFromHealthKit(user: AuthUser) {
    const workouts = await queryWorkoutSamples({
      limit: 10,
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
    for (const workout of workouts) {
      const hr = await queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', {
        limit: 10,
        filter: {
          workout: workout,
        },
      });
      await this.entryService.importFromHealthKit(user, workout, hr);
    }
  }

}
