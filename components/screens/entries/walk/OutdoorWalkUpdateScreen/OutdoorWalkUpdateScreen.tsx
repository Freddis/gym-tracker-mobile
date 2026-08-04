import {FC} from 'react';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {Stack} from 'expo-router';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {useAtom} from 'jotai';
import {ThemedScrollView} from '../../../../blocks/ThemedScrollView/ThemedScrollView';
import {EntryEditingBlock} from '../../../../blocks/EntryEditingBlock/EntryEditingBlock';
import {outdoorWalkAtom} from './utils/outdoorWalkAtom';
import {View} from 'react-native';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {RoutedWorkoutEditSection} from '../../../../blocks/RoutedWorkoutEditSection/RoutedWorkoutEditSection';
import {OutdoorWalkAppEntry} from '../../../../../types/models/AppEntry';

export const OutdoorWalkUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(outdoorWalkAtom);
  const [entry] = useAtom(entryAtom);
  const {entryAtomService} = useServices();
  const onEntryUpdate = (updated: OutdoorWalkAppEntry) => {
    entryAtomService.update(updated);
  };

  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Entry', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ThemedScrollView className="h-full" nestedScrollEnabled={false}>
        <View className="p-m">
          <EntryEditingBlock entry={entry}>
            <RoutedWorkoutEditSection entry={entry} onUpdate={onEntryUpdate} />
          </EntryEditingBlock>
        </View>
      </ThemedScrollView>
    </AppScreenContainer>
  );
};
