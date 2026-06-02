import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import React, {FC, useState} from 'react';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {ImageUploadButton} from '../../../../blocks/ImageUploadButton/ImageUploadButton';
import {Separator} from '../../../../blocks/Separator/Separator';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {ScreenContainer} from '../../../../blocks/ScreenContainer/ScreenContainer';
import {ThemedTextInput} from '../../../../blocks/ThemedInput/ThemedInput';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {dateToString} from '../../../../../utils/dateToString';
import {DateTimeUpdateModal} from '../../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {useUser} from '../../../../providers/AuthProvider/useUser';

export const PostCreateScreen: FC = () => {
  const {entryAtomService, entryService} = useServices();
  const [saving, setSaving] = useState(false);
  const user = useUser();
  if (!user) {
    throw new Error('No user');
  }
  const [date, setDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const onSavePress = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    const noteValue = note.trim() === '' ? null : note.trim();
    await entryService.addPostEntry(user.id, date, noteValue, image);
    entryAtomService.reset();
    router.navigate({
      pathname: '/app/entries/list',
    });
  };
  const updateImage = (image: string) => {
    setImage(image);
  };
  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView contentContainerClassName="h-full p-m">
          <ThemedView className="gap-m">
            <Stack.Screen
              options={{title: 'New Post', headerShown: true,
                headerLeft: () => <BackHeaderButton />,
                headerRight: () => <ThemedLink onPress={onSavePress}>Save</ThemedLink>}}
            />
            <ThemedBlock className="gap-l">
            <View className="flex-row items-center">
                <ThemedText className="grow">Date</ThemedText>
                <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(date)}</ThemedText>
              </View>
              <Separator/>
              <View className="gap-s">
                <ThemedText>Note</ThemedText>
                <ThemedTextInput
                  value={note}
                  onChangeText={setNote}
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
                <ImageUploadButton onChange={updateImage} onRemove={() => setImage(null)} value={null} className="w-full h-80"/>
              </View>
            </ThemedBlock>
          </ThemedView>
          <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={date} visible={dateModalVisible} onUpdate={setDate} />
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
