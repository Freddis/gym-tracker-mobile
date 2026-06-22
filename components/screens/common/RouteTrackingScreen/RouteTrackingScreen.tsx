import {Alert, View} from 'react-native';
import {ThemedView} from '../../../blocks/ThemedView/ThemedView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {ThemedButton} from '../../../blocks/ThemedButton/ThemedButton';
import {FC, useEffect, useState} from 'react';
import {AppWorkoutMap} from '../../../blocks/AppWorkoutMap/AppWorkoutMap';
import {usePathDataProcessing} from '../../../../utils/usePathDataProcessing';
import {TimerBlock} from '../../../blocks/TimerBlock/TimerBlock';
import {
  useLocationPermissions,
  useBackgroundLocation,
  useLocationUpdates,
  LocationAccuracy,
  LocationActivityType,
  isTracking,
  Coords,
} from '@gabriel-sisjr/react-native-background-location';
import {getItemAsync, setItemAsync} from 'expo-secure-store';
import {coerce, object, string} from 'zod';
import uuid from 'react-native-uuid';
import {AppPathDataPoint} from '../../../../types/models/AppPathDataPoint';

const storageKey = 'lastTrip';
const validator = object({
  tripId: string(),
  started: coerce.date(),
});
type RouteTrackingScreenProps = {
  onStop: (start: Date, stop: Date, locations: Coords[]) => Promise<AppPathDataPoint[]>;
};
export const RouteTrackingScreen: FC<RouteTrackingScreenProps> = (props) => {
  const {onStop} = props;
  const [tripId, setTripId] = useState<string>(uuid.v4());
  const [started, setStarted] = useState<Date | null>(null);
  const [finished, setFinished] = useState<Date | null>(null);
  const [path, setPath] = useState<AppPathDataPoint[]>([]);
  const {permissionStatus, requestPermissions} = useLocationPermissions();
  const bgLocation = useBackgroundLocation();
  const {locations, lastLocation} = useLocationUpdates();
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const status = await isTracking();
        if (status.active && status.tripId) {
          const item = await getItemAsync(storageKey) ?? '{}';
          const parsed = validator.safeParse(JSON.parse(item));
          if (!parsed.success) {
            throw new Error('Invalid item');
          }
          setTripId(parsed.data.tripId);
          setStarted(parsed.data.started);
          // Alert.alert('Recovery Successful', 'The session has been picked up');

        } else if (status.tripId && !status.active) {
          const item = await getItemAsync(storageKey) ?? '{}';
          const parsed = validator.safeParse(JSON.parse(item));
          if (!parsed.success) {
            throw new Error('Invalid item');
          }
          await bgLocation.startTracking(parsed.data.tripId);
          setTripId(parsed.data.tripId);
          setStarted(parsed.data.started);
          Alert.alert('Recovery Successful', 'The session has been started again');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_: unknown) {
        Alert.alert('Recovery failed', 'Please try again');
      }
    };
    recoverSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const startWalk = async () => {
    if (!permissionStatus.hasAllPermissions) {
      const result = await requestPermissions();
      if (!result) {
        return;
      }
    }
    const started = new Date();
    setItemAsync(storageKey, JSON.stringify({tripId, started}));
    await bgLocation.startTracking(tripId, {
      accuracy: LocationAccuracy.HIGH_ACCURACY,
      activityType: LocationActivityType.FITNESS,
      waitForAccurateLocation: true,
    });
    setStarted(started);
  };
  const stopWalk = async () => {
    await bgLocation.stopTracking();
    const stopDate = new Date();
    setFinished(stopDate);
    const newPath = await onStop(started ?? new Date(), stopDate, locations);
    setPath(newPath);
  };
  const data = usePathDataProcessing(path, started ?? new Date(), [path]);

  return (
    <ThemedView className="p-m h-full">
      {!started && <ThemedButton onPress={startWalk}>Start</ThemedButton>}
      {started && (
        <View className="gap-m">
          <View className="flex-row">
            <ThemedText>Time: </ThemedText>
            <TimerBlock start={started} end={finished ?? undefined}/>
          </View>
          <View className="flex-row">
            <ThemedText>Tracking: </ThemedText>
            <ThemedText>{bgLocation.isTracking ? 'Active' : 'Inactive'}</ThemedText>
          </View>
          <View>
            <ThemedText>Points: {locations.length}</ThemedText>
          </View>
          {lastLocation && (
            <View>
              <ThemedText>Last: {lastLocation.latitude}, {lastLocation.longitude}</ThemedText>
            </View>
          )}
          {!finished && (
            <ThemedButton onPress={stopWalk}>Stop</ThemedButton>
          )}
          {finished && (
            <View className="h-80">
              <AppWorkoutMap data={data} />
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
};
