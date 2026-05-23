import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {WeightAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {PrimitiveAtom, useAtom} from 'jotai';

export const WeightBlock: FC<{entryAtom: PrimitiveAtom<WeightAppEntry>, onPress?: (x: WeightAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const weight = entry.weight;
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
          <ThemedText className="font-bold text-lg">Weight</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View className="flex-row justify-end">
          <View className="items-end">
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={entry} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} readonly/>
          </View>
        </View>
        <View className="flex-row items-center justify-center">
          <ThemedText className="font-semibold">
            <ThemedText className="text-4xl">{weight.weight.toFixed(2)}</ThemedText>
            {weight.units}
          </ThemedText>
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
