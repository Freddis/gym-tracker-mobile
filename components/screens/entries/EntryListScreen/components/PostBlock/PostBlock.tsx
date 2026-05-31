import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {PostAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {PrimitiveAtom, useAtom} from 'jotai';
import {PostContent} from '../PostContent/PostContent';

export const PostBlock: FC<{entryAtom: PrimitiveAtom<PostAppEntry>, onPress?: (x: PostAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const onPress = () => {
    if (props.onPress) {
      props.onPress(entry);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = entry.time;
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock>
        <View className="flex-row items-center justify-between">
          <ThemedText className="font-bold text-lg">Post</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View className="flex-row justify-end">
          <View className="items-end">
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={entry} readonly onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})}/>
          </View>
        </View>
        <View className="flex-col items-start justify-start">
          <PostContent entry={entry} />
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
