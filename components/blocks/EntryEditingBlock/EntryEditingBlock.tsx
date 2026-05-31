import {router} from 'expo-router';
import {FC, ReactNode, useState} from 'react';
import {View} from 'react-native';
import {AppEntry} from '../../../types/models/AppEntry';
import {dateToString} from '../../../utils/dateToString';
import {useServices} from '../../providers/ServiceProvider/ServiceProvider';
import {DateTimeUpdateModal} from '../DateTimeUpdateModal/DateTimeUpdateModal';
import {ImageUploadButton} from '../ImageUploadButton/ImageUploadButton';
import {Separator} from '../Separator/Separator';
import {ThemedBlock} from '../ThemedBlock/ThemedBlock';
import {ThemedTextInput} from '../ThemedInput/ThemedInput';
import {ThemedLink} from '../ThemedLink/ThemedLink';
import {ThemedText} from '../ThemedText/ThemedText';

interface EntryEditingBlockProps {
  entry: AppEntry;
  children?: ReactNode | ReactNode[];
}
export const EntryEditingBlock: FC<EntryEditingBlockProps> = (props) => {
  const entry = props.entry;
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
    <ThemedBlock>
      <View className="flex-row items-center">
        <ThemedText className="grow">Date</ThemedText>
        <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
      </View>
      <Separator />
      <View className="flex-col gap-s">
        <ThemedText className="grow">Note</ThemedText>
        <View className="h-20">
        <ThemedTextInput
          variant="on-surface"
          onChangeText={updateNote}
          className="w-full h-full p-s grow rounded-sm text-sm"
          value={note} placeholder="Leave a note" multiline numberOfLines={3} />
          </View>
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
      {props.children}
      <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
    </ThemedBlock>
  );
};
