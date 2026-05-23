import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorWalkAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';
import {PrimitiveAtom, useAtom} from 'jotai';

export const OutdoorWalkBlock: FC<{entryAtom: PrimitiveAtom<OutdoorWalkAppEntry>, onPress?: (x: OutdoorWalkAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const outdoorWalk = entry.outdoorWalk;
  const onPress = () => {
    if (props.onPress) {
      props.onPress(entry);
    }
  };
  const date = entry.time;

  return (
    <Pressable onPress={onPress}>
      <ThemedBlock>
        <View className="flex-row items-center justify-between">
          <ThemedText className="font-bold text-lg">Walk</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <RoutedWorkoutContent entry={entry} workout={outdoorWalk} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
      </ThemedBlock>
    </Pressable>
  );
};
