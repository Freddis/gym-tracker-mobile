import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {PostAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';
import {PrimitiveAtom, useAtom} from 'jotai';

export const PostBlock: FC<{entryAtom: PrimitiveAtom<PostAppEntry>, onPress?: (x: PostAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const image = entry.image;
  const onPress = () => {
    if (props.onPress) {
      props.onPress(entry);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = entry.time;
  const imageSrc = image?.image ? `data:image/jpeg;base64,${image.image}` : undefined;
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
          {entry.title && (
            <ThemedText className="font-semibold">
              {entry.title}
            </ThemedText>
          )}
          {entry.note && <ThemedText>{entry.note}</ThemedText>}
          {entry.image && <ThemedImage source={{uri: image?.url ?? imageSrc}} className="w-full h-80 rounded-md mt-s"/>}
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
