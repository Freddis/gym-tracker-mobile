import {FC, useState} from 'react';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {router, Stack} from 'expo-router';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {useAtom} from 'jotai';
import {defaultEntryAtom} from './utils/defaultEntryAtom';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {View} from 'react-native';
import {dateToString} from '../../../../utils/dateToString';
import {Separator} from '../../../blocks/Separator/Separator';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {ThemedView} from '../../../blocks/ThemedView/ThemedView';
import {DateTimeUpdateModal} from '../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {ImageUploadButton} from '../../../blocks/ImageUploadButton/ImageUploadButton';
import {ThemedTextInput} from '../../../blocks/ThemedInput/ThemedInput';


export const DefaultEntryUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(defaultEntryAtom);
  const [entry] = useAtom(entryAtom);
  const [note, setNote] = useState(entry.note ?? '');
  const {entryAtomService} = useServices();
  const [dateValue, setDate] = useState(entry.time);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const updateDate = async (date: Date) => {
    setDate(date);
    await entryAtomService.updateTime(entry, date);
  };

  const updateImage = async (image: string | null) => {
    await entryAtomService.updateImage(entry, image);
  };

  const updateNote = async (note: string) => {
    setNote(note);
    await entryAtomService.updateNote(entry, note);
  };

  const deleteEntry = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Entry', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ThemedScrollView className="h-full p-m" nestedScrollEnabled={false}>
          <ThemedView>
            <ThemedBlock>
              <View className="flex-row items-center">
                <ThemedText className="grow">Date</ThemedText>
                <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
              </View>
              <Separator />
              <View className="flex-col gap-s">
                <ThemedText className="grow">Note</ThemedText>
                <ThemedTextInput
                  variant="on-surface"
                  onChangeText={updateNote}
                  className="w-full h-50 p-s grow rounded-sm text-sm"
                  value={note} placeholder="Leave a note" multiline numberOfLines={5} />
              </View>
              <Separator />
              <View className="flex-row items-center justify-between">
                <ThemedText>Image</ThemedText>
                <ImageUploadButton
                  value={entryAtomService.getImageSource(entry)}
                  onChange={updateImage}
                  className="w-20 h-20"
                  onRemove={() => updateImage(null)}
                />
              </View>
              <Separator />
              <View className="flex-row justify-center gap-40">
                <ThemedLink accented onPress={deleteEntry}>Delete</ThemedLink>
              </View>
            </ThemedBlock>
          </ThemedView>
        </ThemedScrollView>
        <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
    </ScreenContainer>
  );
};
