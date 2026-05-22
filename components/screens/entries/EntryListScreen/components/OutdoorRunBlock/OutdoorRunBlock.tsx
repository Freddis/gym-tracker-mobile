import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorRunAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';
import {useAtom, PrimitiveAtom} from 'jotai';

export const OutdoorRunBlock: FC<{entryAtom: PrimitiveAtom<OutdoorRunAppEntry>, onPress?: (x: OutdoorRunAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const outdoorRun = entry.outdoorRun;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(entry);
    }
  };
  const date = entry.time;

  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Outdoor Run</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <RoutedWorkoutContent entry={entry} workout={outdoorRun} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
      </ThemedBlock>
    </Pressable>
  );
};
