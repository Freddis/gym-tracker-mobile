import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {WeightAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';

export const WeightBlock: FC<{entry: WeightAppEntry, onPress?: (x: WeightAppEntry)=> void}> = (props) => {
  const weight = props.entry.weight;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(props.entry);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = props.entry.time;
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Weight</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={{marginBottom: theme.marginM, flexDirection: 'row-reverse'}}>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={props.entry} readonly/>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <ThemedText style={{fontWeight: 'semibold'}}>
            <ThemedText style={{fontSize: 40, lineHeight: 40}}>{weight.weight}</ThemedText>
            {weight.units}
          </ThemedText>
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
