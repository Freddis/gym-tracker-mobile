import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import React, {FC, useState} from 'react';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {useAtom} from 'jotai';
import {dateToString} from '../../../../../utils/dateToString';
import {DateTimeUpdateModal} from '../../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {ImageUploadButton} from '../../../../blocks/ImageUploadButton/ImageUploadButton';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {EntrySyncButton} from '../../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {postAtom} from './utils/postAtom';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {ThemedTextInput} from '../../../../blocks/ThemedInput/ThemedInput';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {useUser} from '../../../../providers/AuthProvider/useUser';


export const PostUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(postAtom);
  const [entry, setEntry] = useAtom(entryAtom);
  const {entryAtomService, entryService} = useServices();
  const user = useUser();
  if (!user) {
    throw new Error('No user');
  }
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [note, setNote] = useState(entry.note);
  const imageSrc = entryAtomService.getImageSource(entry);
  const [image, setImage] = useState<string | null>(imageSrc);
  const router = useRouter();

  const updateDate = async (date: Date) => {
    const updatedEntry = await entryAtomService.updateTime(entry, date);
    setEntry(updatedEntry);
  };

  const updateImage = async (image: string | null) => {
    setImage(image);
    const result = await entryService.saveEntry({
      ...entry,
    }, image);
    setEntry(result);
  };
  const updateNote = async (text: string) => {
    setNote(text);
    const result = await entryService.saveEntry({
      ...entry,
      note: text,
    });
    setEntry(result);
  };


  const deleteEntry = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };

  return (
    <AppScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView contentContainerClassName="h-full p-m">
          <ThemedView className="gap-m">
            <Stack.Screen options={{title: 'Post Entry', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
            <ThemedBlock>
              <View className="flex-row items-center">
                <ThemedText className="grow">Date</ThemedText>
                <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(entry.time)}</ThemedText>
              </View>
              <Separator/>
              <View className="flex-row items-center">
                <ThemedText className="grow">Synced</ThemedText>
                <EntrySyncButton entry={entry} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
              </View>
              <Separator />
              <View className="gap-s">
                <ThemedText>Note</ThemedText>
                <ThemedTextInput
                  value={note ?? ''}
                  onChangeText={updateNote}
                  placeholder="Leave a note"
                  multiline
                  numberOfLines={10}
                  variant="on-surface"
                  className="h-40"
                />
              </View>
              <Separator/>
              <View className="gap-s">
                <ThemedText>Image</ThemedText>
                <ImageUploadButton onChange={updateImage} onRemove={() => updateImage(null)} value={image} className="w-full h-80"/>
              </View>
              <Separator />
              <View className="flex-row justify-center gap-40">
                <ThemedLink onPress={deleteEntry}>Delete</ThemedLink>
              </View>
            </ThemedBlock>
          </ThemedView>
          <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={entry.time} visible={dateModalVisible} onUpdate={updateDate} />
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </AppScreenContainer>
  );
};
