import {StyleSheet, View, KeyboardAvoidingView, Platform, Modal} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import React, {FC, useEffect, useState} from 'react';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {useEntryService} from '../../../../utils/EntryService/useEntryService';
import {EntrySyncButton} from '../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {DateTimeUpdateModal} from '../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {ImageUploadButton} from '../../../blocks/ImageUploadButton/ImageUploadButton';
import {TextArea} from 'react-native-ui-lib';

export const PostEditScreen: FC = () => {
  const theme = useAppTheme();
  const [entryService] = useEntryService();
  const styles = getStyles(theme);
  const auth = useAuth();
  const user = auth.user;
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  if (!user) {
    throw new Error('No user');
  }
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [dateValue, setDate] = useState(new Date());
  const params = useLocalSearchParams();
  const router = useRouter();
  const validated = ZodHelper.validators.numberOrStringNumber.safeParse(params.entryId);
  const entryId = validated.success ? validated.data : 0;
  const queryResult = entryService.usePostEntry(entryId, [entryId]);
  const entry = queryResult.data;

  useEffect(() => {
    if (!entry) {
      return;
    }
    setDate(entry.time);
    setNote(entry.note ?? '');
    if (entry.image?.url) {
      setImage(entry.image.url);
    }
    if (entry.image?.image) {
      setImage(`data:image/jpeg;base64,${entry.image.image}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  if (!queryResult.data || !entry) {
    return <LoadingBlock />;
  }

  const updateDate = (date: Date) => {
    setDate(date);
    entryService.saveEntry({
      ...entry,
      time: date,
    });
  };
  const updateImage = (image: string | null) => {
    setImage(image);
    entryService.saveEntry({
      ...entry,
    }, image);
  };
  const updateNote = (text: string) => {
    setNote(text);
    entryService.saveEntry({
      ...entry,
      note: text,
    });
  };
  const dateToString = (date: Date):string => {
    return [
      date.toLocaleDateString(),
      [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0'),
      ].join(':'),
    ].join(' ');
  };

  const deleteEntry = async () => {
    await entryService.deleteEntry(entryId);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView style={{minHeight: '100%'}}>
        <ThemedView style={styles.container}>
          <Stack.Screen options={{title: `Post Entry ${entry.id}`, headerShown: true}} />
          <ThemedBlock>

            <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
              <ThemedText style={{flexGrow: 1}}>Date</ThemedText>
              <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
            </View>
            <Separator/>
            <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
              <ThemedText style={{flexGrow: 1}}>Synced</ThemedText>
              <EntrySyncButton entry={queryResult.data} />
            </View>
            <Separator />
            <View style={{flexDirection: 'column', gap: theme.marginS, marginBottom: theme.marginS}}>
              <ThemedText>Note</ThemedText>
               <TextArea
               color={theme.text}
               borderRadius={theme.borderRadiusS}
               height={100}
               padding={theme.paddingS}
               onChangeText={updateNote}
               width="100%"
               backgroundColor={theme.background} value={note} placeholder="Leave a note" multiline numberOfLines={10} />
            </View>
            <Separator/>
            <View style={{flexDirection: 'column', gap: theme.marginS, marginBottom: theme.marginS}}>
              <ThemedText>Image</ThemedText>
              <ImageUploadButton onChange={updateImage} onRemove={() => updateImage(null)} value={image} style={{width: '100%', height: 300}}/>
            </View>
            <Separator />
            <View style={{flexDirection: 'row', justifyContent: 'center', gap: 40}}>
              <ThemedLink onPress={deleteEntry}>Delete</ThemedLink>
            </View>
          </ThemedBlock>
        </ThemedView>
        <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
        <Modal visible={weightModalVisible} transparent animationType="none">
          <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
            <View style={{backgroundColor: theme.surface}}>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <ThemedLink style={{fontSize: 16, margin: theme.marginS}} onPress={() => setWeightModalVisible(false)}>Done</ThemedLink>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: theme.paddingM,
    marginBottom: 80,
    gap: theme.marginL,
    flex: 1,
    flexGrow: 1,
  },
});
