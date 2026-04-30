import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorRunAppEntry} from '../../../../../../types/models/AppEntry';
import {RoutedWorkoutContent} from '../RoutedWorkoutContent/RoutedWorkoutContent';

export const OutdoorRunBlock: FC<{entry: OutdoorRunAppEntry, onPress?: (x: OutdoorRunAppEntry)=> void}> = (props) => {
  const outdoorRun = props.entry.outdoorRun;
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
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Outdoor Run</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <RoutedWorkoutContent entry={props.entry} workout={outdoorRun} />
      </ThemedBlock>
    </Pressable>
  );
};
