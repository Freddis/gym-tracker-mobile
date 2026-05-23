import {View} from 'react-native';
import {OutdoorRun, OutdoorWalk} from '../../../../../../openapi-client';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {durationToTimeString} from '../../../../../../utils/durationToTimeString';
import {paceToString} from '../../../../../../utils/paceToString';
import {AppWorkoutMap} from '../../../../../blocks/AppWorkoutMap/AppWorkoutMap';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {FC} from 'react';
import {getTimeString} from '../../../../../../utils/getTimeString';
import {usePathDataProcessing} from '../../../../../../utils/usePathDataProcessing';
import {speedToPace} from '../../../../../../utils/speedToPace';

export interface RoutedWorkoutContentProps {
  entry: AppEntry;
  workout: OutdoorRun | OutdoorWalk;
  onUpdate: (entry: AppEntry) => void;
}

export const RoutedWorkoutContent: FC<RoutedWorkoutContentProps> = (props) => {
  const path = usePathDataProcessing(props.workout.geoData ?? [], props.workout.start, [props.workout]);
  return (
   <>
    <View className="flex-row justify-between">
    <View className="flex-col items-start gap-s grow">
      <ThemedText>Distance: {(props.workout.distance / 1000).toFixed(3)} km</ThemedText>
      <ThemedText>Duration: {durationToTimeString(props.workout.duration)}</ThemedText>
      <ThemedText>Calories: {props.workout.calories.toFixed(0)}</ThemedText>
    </View>
    <View className="items-end">
      <ThemedText>
      {props.entry.time.toLocaleString('en-GB', {weekday: 'long'})}, {getTimeString(props.entry.time)}
      </ThemedText>
      <ThemedText>Pace: {paceToString(props.workout.pace)} (best: {paceToString(speedToPace(path.maxSpeed))})</ThemedText>
      <EntrySyncButton entry={props.entry} readonly onUpdate={props.onUpdate}/>
    </View>
    </View>
    <View className="flex-col items-start justify-start">
      {props.entry.title && (
        <ThemedText className="font-semibold">
          {props.entry.title}
        </ThemedText>
      )}
      {props.entry.note && <ThemedText>{props.entry.note}</ThemedText>}
      {props.entry.image && (
        <ThemedImage source={{uri: props.entry.image?.url ?? undefined}} className="w-full h-80 mt-s"/>
      )}
      {props.workout.geoData && props.workout.geoData.length > 0 && (
        <View className="w-full h-80 overflow-hidden rounded-md mt-s">
          <AppWorkoutMap
            data={path}
          />
      </View>
    )}
    </View>
   </>
  );
};
