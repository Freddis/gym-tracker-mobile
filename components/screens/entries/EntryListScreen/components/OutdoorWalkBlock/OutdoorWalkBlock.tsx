import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorWalkAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';
import {PrimitiveAtom, useAtom, useSetAtom} from 'jotai';
import {useRouter} from 'expo-router';
import {outdoorWalkAtom} from '../../../walk/OutdoorWalkUpdateScreen/utils/outdoorWalkAtom';

export const OutdoorWalkBlock: FC<{entryAtom: PrimitiveAtom<OutdoorWalkAppEntry>}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const setOutdoorWalkAtom = useSetAtom(outdoorWalkAtom);
  const outdoorWalk = entry.outdoorWalk;
  const router = useRouter();
  const onPress = () => {
    setOutdoorWalkAtom(props.entryAtom);
    router.navigate({
      pathname: '/app/entries/outdoorWalk/outdoorWalkUpdate',
    });
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
