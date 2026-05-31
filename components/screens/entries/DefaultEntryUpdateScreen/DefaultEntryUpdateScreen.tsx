import {FC} from 'react';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {Stack} from 'expo-router';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {useAtom} from 'jotai';
import {defaultEntryAtom} from './utils/defaultEntryAtom';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {EntryEditingBlock} from '../../../blocks/EntryEditingBlock/EntryEditingBlock';

export const DefaultEntryUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(defaultEntryAtom);
  const [entry] = useAtom(entryAtom);

  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Entry', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ThemedScrollView className="h-full p-m" nestedScrollEnabled={false}>
        <EntryEditingBlock entry={entry} />
      </ThemedScrollView>
    </ScreenContainer>
  );
};
