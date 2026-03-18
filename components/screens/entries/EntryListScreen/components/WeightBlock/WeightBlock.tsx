import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {AppWeight} from '../../../../../../types/models/AppWeight';
import {WeightAppEntry} from '../../../../../../types/models/AppEntry';

export const WeightBlock: FC<{entry: WeightAppEntry, onPress?: (x: AppWeight)=> void}> = (props) => {
  const weight = props.entry.weight;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(weight);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Weight</ThemedText>
          <ThemedText>
            {weight.createdAt.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={{marginBottom: theme.marginM, flexDirection: 'row-reverse'}}>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {weight.createdAt.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(weight.createdAt)}
            </ThemedText>
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
