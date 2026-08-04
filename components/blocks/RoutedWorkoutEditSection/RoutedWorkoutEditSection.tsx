import {useState} from 'react';
import {Alert, View, Modal, ActivityIndicator, Pressable} from 'react-native';
import {durationToTimeString} from '../../../utils/durationToTimeString';
import {getTimeString} from '../../../utils/getTimeString';
import {paceToString} from '../../../utils/paceToString';
import {RoutedWorkoutEntry} from '../../../utils/RoutedWorkoutService/types/RoutedWorkoutEntry';
import {RoutedWorkoutType} from '../../../utils/RoutedWorkoutService/types/RoutedWorkoutType';
import {speedToPace} from '../../../utils/speedToPace';
import {usePathDataProcessing} from '../../../utils/usePathDataProcessing';
import {useUser} from '../../providers/AuthProvider/useUser';
import {useServices} from '../../providers/ServiceProvider/ServiceProvider';
import {SyncIcon} from '../../screens/entries/EntryListScreen/components/SyncIcon/SyncIcon';
import {AppWorkoutMap} from '../AppWorkoutMap/AppWorkoutMap';
import {Separator} from '../Separator/Separator';
import {ThemedBlock} from '../ThemedBlock/ThemedBlock';
import {ThemedLink} from '../ThemedLink/ThemedLink';
import {ThemedText} from '../ThemedText/ThemedText';
import {DistanceUpdateModal} from '../DistanceUpdateModal/DistanceUpdateModal';

interface RoutedWorkoutEditSectionProps<T extends RoutedWorkoutType> {
  entry: RoutedWorkoutEntry<T>;
  onUpdate: (entry: RoutedWorkoutEntry<T>) => void;
}

export const RoutedWorkoutEditSection = <T extends RoutedWorkoutType>(props: RoutedWorkoutEditSectionProps<T>) => {
  const {entry} = props;
  const user = useUser();
  const {healthKitService, routedWorkoutService} = useServices();
  const workout = routedWorkoutService.getWorkout(entry);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const path = usePathDataProcessing(workout.geoData ?? [], workout.start, [workout.geoData]);
  const reImport = async () => {
    setShowImportModal(true);
    try {
      const walk = await healthKitService.reImport(user, entry);
      props.onUpdate(walk);
      Alert.alert('Re-Import', 'Entry Re-Imported Successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to re-import entry');
      return;
    }
    setShowImportModal(false);
  };
  const deleteMap = async () => {
    routedWorkoutService.deleteMap(entry);
    props.onUpdate(entry);
    Alert.alert('Delete Map', 'Map Deleted Successfully');
  };
  const onDistanceUpdate = async (value: number) => {
    const newEntry = await routedWorkoutService.updateDistance(entry, value);
    props.onUpdate(newEntry);
  };
  // const normalizePath = async () => {
  //   const walk = await routedWorkoutService.normalizeEntry(entry);
  //   props.onUpdate(walk);
  //   Alert.alert('Normalize Path', 'Path Updated Successfully');
  // };
  const onDistancePress = () => {
    setShowDistanceModal(true);
  };
  return (
  <>
    <Separator/>
    <View className="flex-row justify-between">
      <View className="flex-col items-start gap-s grow">
        <Pressable onPress={onDistancePress}>
          <ThemedText>Distance: {(workout.distance / 1000).toFixed(3)} km</ThemedText>
        </Pressable>
        <ThemedText>Duration: {durationToTimeString(workout.duration)}</ThemedText>
        <ThemedText>Calories: {workout.calories.toFixed(0)}</ThemedText>
      </View>
      <View className="items-end">
        <ThemedText>
        {entry.time.toLocaleString('en-GB', {weekday: 'long'})}, {getTimeString(entry.time)}
        </ThemedText>
        <ThemedText>Pace: {paceToString(workout.pace)} (best: {paceToString(speedToPace(path.maxSpeed))})</ThemedText>
        <SyncIcon object={entry} />
      </View>
    </View>
    {workout.geoData && workout.geoData.length > 0 && (
      <View className="w-full h-80 overflow-hidden rounded-md mt-s" onStartShouldSetResponder={() => true}>
        <AppWorkoutMap
          data={path}
        />
    </View>
    )}
    <Separator/>
    <View className="flex-row justify-center gap-40">
      {entry.healthkitId && (
        <ThemedLink accented onPress={reImport}>Re-Import</ThemedLink>
      )}
      {workout.geoData && (
        <ThemedLink accented onPress={deleteMap}>Delete Map</ThemedLink>
      )}
      {/* <ThemedLink accented onPress={normalizePath}>Normalize Path</ThemedLink> */}
    </View>
    <Modal visible={showImportModal} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black-90">
        <ThemedBlock className="w-2/3 gap-m">
          <ThemedText className="text-center">Importing data from Health Kit</ThemedText>
          <ActivityIndicator size="large"/>
        </ThemedBlock>
      </View>
    </Modal>
    <DistanceUpdateModal
      value={workout.distance}
      visible={showDistanceModal}
      onClose={() => setShowDistanceModal(false)}
      onUpdate={onDistanceUpdate} />
  </>
  );
};
