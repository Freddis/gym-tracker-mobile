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
