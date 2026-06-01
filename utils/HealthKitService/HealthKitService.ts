import {
  AuthorizationStatus,
  authorizationStatusFor,
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
    const workoutTypeStatus = authorizationStatusFor('HKWorkoutTypeIdentifier');
    const workoutRouteTypeStatus = authorizationStatusFor('HKWorkoutRouteTypeIdentifier');
    const heartRateStatus = authorizationStatusFor('HKQuantityTypeIdentifierHeartRate');
    const authorized = workoutTypeStatus === AuthorizationStatus.sharingAuthorized
    && workoutRouteTypeStatus === AuthorizationStatus.sharingAuthorized
    && heartRateStatus === AuthorizationStatus.sharingAuthorized;
    if (!authorized) {
      return;
    }
    await this.importFromHealthKit(user);
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
