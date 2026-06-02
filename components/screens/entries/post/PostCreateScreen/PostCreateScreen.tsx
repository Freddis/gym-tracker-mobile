import {StyleSheet, View, KeyboardAvoidingView, Platform} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import React, {FC, useState} from 'react';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {TextArea} from 'react-native-ui-lib';
import {ImageUploadButton} from '../../../../blocks/ImageUploadButton/ImageUploadButton';
import {Separator} from '../../../../blocks/Separator/Separator';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';

export const PostCreateScreen: FC = () => {
  const theme = useAppTheme();
  const {entryAtomService, entryService} = useServices();
  const styles = getStyles(theme);
  const auth = useAuth();
  const user = auth.user;
  if (!user) {
    throw new Error('No user');
  }
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const onSavePress = async () => {
    const noteValue = note.trim() === '' ? null : note.trim();
    await entryService.addPostEntry(user.id, noteValue, image);
    entryAtomService.reset();
    router.navigate({
      pathname: '/app/entries/list',
    });
  };

  const updateImage = (image: string) => {
    setImage(image);
  };
  const imageSrc = image ? `data:image/jpeg;base64,${image}` : null;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView style={{minHeight: '100%'}}>
        <ThemedView style={styles.container}>
          <Stack.Screen options={{title: 'New Post', headerShown: true, headerRight: () => <ThemedLink onPress={onSavePress}>Save</ThemedLink>}} />
          <ThemedBlock style={{flexDirection: 'column', gap: theme.marginL}}>
            <View style={{flexDirection: 'column', gap: theme.marginS}}>
              <ThemedText>Note</ThemedText>
               <TextArea
               color={theme.text}
               borderRadius={theme.borderRadiusS}
               height={100}
               padding={theme.paddingS}
               onChangeText={setNote}
               width="100%"
               value={note}
               backgroundColor={theme.background} placeholder="Leave a note" multiline numberOfLines={10} />
            </View>
            <Separator/>
            <View style={{flexDirection: 'column', gap: theme.marginS}}>
              <ThemedText>Image</ThemedText>
              <ImageUploadButton onChange={updateImage} onRemove={() => setImage(null)} value={imageSrc} style={{width: '100%', height: 300}}/>
            </View>
          </ThemedBlock>
        </ThemedView>
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
