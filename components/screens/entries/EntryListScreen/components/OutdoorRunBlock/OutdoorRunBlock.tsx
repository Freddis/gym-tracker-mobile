import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorRunAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';
import {useAtom, PrimitiveAtom} from 'jotai';

export const OutdoorRunBlock: FC<{entryAtom: PrimitiveAtom<OutdoorRunAppEntry>, onPress?: (x: OutdoorRunAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const outdoorRun = entry.outdoorRun;
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
          <ThemedText className="font-bold text-lg">Outdoor Run</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <RoutedWorkoutContent entry={entry} workout={outdoorRun} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
      </ThemedBlock>
    </Pressable>
  );
};
