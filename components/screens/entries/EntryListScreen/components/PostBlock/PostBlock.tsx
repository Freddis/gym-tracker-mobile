import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {PostAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';

export const PostBlock: FC<{entry: PostAppEntry, onPress?: (x: PostAppEntry)=> void}> = (props) => {
  const image = props.entry.image;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(props.entry);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = props.entry.time;
  const imageSrc = image?.image ? `data:image/jpeg;base64,${image.image}` : undefined;
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Post</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={{marginBottom: theme.marginS, flexDirection: 'row-reverse'}}>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={props.entry} readonly/>
          </View>
        </View>
        <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
          {props.entry.title && (
            <ThemedText style={{fontWeight: 'semibold'}}>
              {props.entry.title}
            </ThemedText>
          )}
          {props.entry.note && <ThemedText>{props.entry.note}</ThemedText>}
          {props.entry.image && <ThemedImage source={{uri: image?.url ?? imageSrc}} style={{width: '100%', height: 300, marginTop: theme.marginS}}/>}
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
