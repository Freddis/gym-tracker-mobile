import {FC, useEffect, useState} from 'react';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {Stack} from 'expo-router';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {useAtom} from 'jotai';
import {ThemedScrollView} from '../../../../blocks/ThemedScrollView/ThemedScrollView';
import {EntryEditingBlock} from '../../../../blocks/EntryEditingBlock/EntryEditingBlock';
import {outdoorWalkAtom} from './utils/outdoorWalkAtom';
import {Separator} from '../../../../blocks/Separator/Separator';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {ActivityIndicator, Alert, Modal, View} from 'react-native';
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
import {useUser} from '../../../../providers/AuthProvider/useUser';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';

export const OutdoorWalkUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(outdoorWalkAtom);
  const [entry, setEntry] = useAtom(entryAtom);
  const [showImportModal, setShowImportModal] = useState(false);
  // since we don't want to actually mutate the entry, we need separate state for walk
  const [outdoorWalk, setOutdoorWalk] = useState<AppOutdoorWalk>(entry.outdoorWalk);
  const {outdoorWalkService, healthKitService} = useServices();
  const user = useUser();
  useEffect(() => {
    // updating walk state on actual entry mutation
    setOutdoorWalk(entry.outdoorWalk);
  }, [entry]);

  const normalizePath = async () => {
    const walk = await outdoorWalkService.normalizeEntry(outdoorWalk);
    setOutdoorWalk(walk);
    Alert.alert('Normalize Path', 'Path Updated Successfully');
  };
  const reImport = async () => {
    setShowImportModal(true);
    const walk = await healthKitService.reImport(user, entry);
    setEntry(walk);
    Alert.alert('Re-Import', 'Entry Re-Imported Successfully');
    setShowImportModal(false);
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
              {entry.healthkitId && (
                <ThemedLink accented onPress={reImport}>Re-Import</ThemedLink>
              )}
              <ThemedLink accented onPress={normalizePath}>Normalize Path</ThemedLink>
            </View>
          </EntryEditingBlock>
        </View>
        <Modal visible={showImportModal} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black-90">
            <ThemedBlock className="w-2/3 gap-m">
              <ThemedText className="text-center">Importing data from Health Kit</ThemedText>
              <ActivityIndicator size="large"/>
            </ThemedBlock>
          </View>
        </Modal>
      </ThemedScrollView>
    </AppScreenContainer>
  );
};
