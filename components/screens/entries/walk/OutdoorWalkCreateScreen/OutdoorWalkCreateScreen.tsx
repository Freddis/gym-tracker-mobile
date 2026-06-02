import {Stack} from 'expo-router';
import {ScreenContainer} from '../../../../blocks/ScreenContainer/ScreenContainer';
import {Alert, ScrollView, View} from 'react-native';
import {ThemedView} from '../../../../blocks/ThemedView/ThemedView';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {ThemedButton} from '../../../../blocks/ThemedButton/ThemedButton';
import {useEffect, useState} from 'react';
import {AppWorkoutMap} from '../../../../blocks/AppWorkoutMap/AppWorkoutMap';
import {usePathDataProcessing} from '../../../../../utils/usePathDataProcessing';
import {PathPoint} from '../../../../../openapi-client';
import {TimerBlock} from '../../../../blocks/TimerBlock/TimerBlock';
import {
  useLocationPermissions,
  useBackgroundLocation,
  useLocationUpdates,
  LocationAccuracy,
  LocationActivityType,
  isTracking,
} from '@gabriel-sisjr/react-native-background-location';
import {getItemAsync, setItemAsync} from 'expo-secure-store';
import {coerce, object, string} from 'zod';
import uuid from 'react-native-uuid';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {useUser} from '../../../../providers/AuthProvider/useUser';

const storageKey = 'lastTrip';
const validator = object({
  tripId: string(),
  started: coerce.date(),
});

export const OutdoorWalkCreateScreen = () => {
  const [tripId, setTripId] = useState<string>(uuid.v4());
  const [started, setStarted] = useState<Date | null>(null);
  const [finished, setFinished] = useState<Date | null>(null);
  const [path, setPath] = useState<PathPoint[]>([]);
  const {permissionStatus, requestPermissions} = useLocationPermissions();
  const bgLocation = useBackgroundLocation();
  const {locations, lastLocation} = useLocationUpdates();
  const {outdoorWalkService, entryListService} = useServices();
  const user = useUser();
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
    const newPath: PathPoint[] = locations.map((location) => {
      const point: PathPoint = {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        altitude: location.altitude ?? 0,
        horizontalAccuracy: location.accuracy ?? 0,
        verticalAccuracy: location.verticalAccuracyMeters ?? 0,
        speedAccuracy: location.speedAccuracyMetersPerSecond ?? 0,
        course: location.bearing ?? 0,
        speed: location.speed ?? 0,
        distance: null,
        timestamp: location.timestamp ?? 0,
      };
      return point;
    });
    setPath(newPath);
    const outdoorWalk = await outdoorWalkService.createEntry(user, started ?? new Date(), stopDate, newPath);
    entryListService.addEntry(outdoorWalk);
  };
  const data = usePathDataProcessing(path, started ?? new Date(), [path]);

  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Walk'}} />
      <ScrollView className="h-full">
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
      </ScrollView>
    </ScreenContainer>
  );
};
