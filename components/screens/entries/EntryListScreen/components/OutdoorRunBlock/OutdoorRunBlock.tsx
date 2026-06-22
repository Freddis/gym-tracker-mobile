import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorRunAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';
import {useAtom, PrimitiveAtom, useSetAtom} from 'jotai';
import {outdoorRunAtom} from '../../../outdoorRun/OutdoorRunUpdateScreen/utils/outdoorRunAtom';
import {useRouter} from 'expo-router';

export const OutdoorRunBlock: FC<{entryAtom: PrimitiveAtom<OutdoorRunAppEntry>, onPress?: (x: OutdoorRunAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const outdoorRun = entry.outdoorRun;
  const setOutDoorRun = useSetAtom(outdoorRunAtom);
  const router = useRouter();
  const onPress = () => {
    setOutDoorRun(props.entryAtom);
    router.navigate({
      pathname: '/app/entries/outdoorRun/outdoorRunUpdate',
    });
  };
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock>
        <View className="flex-row items-center justify-between">
          <ThemedText className="font-bold text-lg">Outdoor Run</ThemedText>
          <ThemedText>
            {entry.time.toLocaleDateString()}
          </ThemedText>
        </View>
        <RoutedWorkoutContent entry={entry} workout={outdoorRun} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
      </ThemedBlock>
    </Pressable>
  );
};
