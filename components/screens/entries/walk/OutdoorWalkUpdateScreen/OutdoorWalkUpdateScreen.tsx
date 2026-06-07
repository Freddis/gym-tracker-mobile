import {FC, useState} from 'react';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {Stack} from 'expo-router';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {useAtom} from 'jotai';
import {ThemedScrollView} from '../../../../blocks/ThemedScrollView/ThemedScrollView';
import {EntryEditingBlock} from '../../../../blocks/EntryEditingBlock/EntryEditingBlock';
import {outdoorWalkAtom} from './utils/outdoorWalkAtom';
import {Separator} from '../../../../blocks/Separator/Separator';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {Alert, View} from 'react-native';
import {AppWorkoutMap} from '../../../../blocks/AppWorkoutMap/AppWorkoutMap';
import {usePathDataProcessing} from '../../../../../utils/usePathDataProcessing';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {durationToTimeString} from '../../../../../utils/durationToTimeString';
import {getTimeString} from '../../../../../utils/getTimeString';
import {paceToString} from '../../../../../utils/paceToString';
import {speedToPace} from '../../../../../utils/speedToPace';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {SyncIcon} from '../../EntryListScreen/components/SyncIcon/SyncIcon';
import {AppOutdoorWalk} from '../../../../../types/models/AppOutdoorWalk';

export const OutdoorWalkUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(outdoorWalkAtom);
  const [entry] = useAtom(entryAtom);
  const [outdoorWalk, setOutdoorWalk] = useState<AppOutdoorWalk>(entry.outdoorWalk);
  const {outdoorWalkService} = useServices();

  const normalizePath = async () => {
    const walk = await outdoorWalkService.normalizeEntry(outdoorWalk);
    setOutdoorWalk(walk);
    Alert.alert('Normalize Path', 'Path Updated Successfully');
  };

  const path = usePathDataProcessing(outdoorWalk.geoData ?? [], outdoorWalk.start, [outdoorWalk.geoData]);
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Entry', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ThemedScrollView className="h-full" nestedScrollEnabled={false}>
        <View className="p-m">
          <EntryEditingBlock entry={entry}>
            <Separator/>
            <View className="flex-row justify-between">
              <View className="flex-col items-start gap-s grow">
                <ThemedText>Distance: {(outdoorWalk.distance / 1000).toFixed(3)} km</ThemedText>
                <ThemedText>Duration: {durationToTimeString(outdoorWalk.duration)}</ThemedText>
                <ThemedText>Calories: {outdoorWalk.calories.toFixed(0)}</ThemedText>
              </View>
              <View className="items-end">
                <ThemedText>
                {entry.time.toLocaleString('en-GB', {weekday: 'long'})}, {getTimeString(entry.time)}
                </ThemedText>
                <ThemedText>Pace: {paceToString(outdoorWalk.pace)} (best: {paceToString(speedToPace(path.maxSpeed))})</ThemedText>
                <SyncIcon object={entry} />
              </View>
            </View>
            {outdoorWalk.geoData && outdoorWalk.geoData.length > 0 && (
              <View className="w-full h-80 overflow-hidden rounded-md mt-s" onStartShouldSetResponder={() => true}>
                <AppWorkoutMap
                  data={path}
                />
            </View>
            )}
            <Separator/>
            <View className="flex-row justify-center gap-40">
              <ThemedLink accented onPress={normalizePath}>Normalize Path</ThemedLink>
            </View>
          </EntryEditingBlock>
        </View>
      </ThemedScrollView>
    </AppScreenContainer>
  );
};
