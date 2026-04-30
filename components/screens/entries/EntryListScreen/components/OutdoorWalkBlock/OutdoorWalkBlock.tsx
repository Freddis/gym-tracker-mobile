import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorWalkAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';

export const OutdoorWalkBlock: FC<{entry: OutdoorWalkAppEntry, onPress?: (x: OutdoorWalkAppEntry)=> void}> = (props) => {
  const outdoorWalk = props.entry.outdoorWalk;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(props.entry);
    }
  };
  const date = props.entry.time;

  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Walk</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <RoutedWorkoutContent entry={props.entry} workout={outdoorWalk} />
      </ThemedBlock>
    </Pressable>
  );
};
