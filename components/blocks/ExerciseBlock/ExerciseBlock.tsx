import {FC, Fragment, useState} from 'react';
import {Pressable, View, StyleProp, ViewStyle} from 'react-native';
import {ThemedText} from '../ThemedText/ThemedText';
import {ExerciseBlockProps} from './types/ExerciseBlockProps';
import {ThemedIcon} from '../ThemedIcon/ThemedIcon';
import {ThemedBlock} from '../ThemedBlock/ThemedBlock';
import {ThemedImage} from '../ThemedImage/ThemedImage';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Separator} from '../Separator/Separator';


export const ExerciseBlock: FC<ExerciseBlockProps> = (props) => {
  const [opened, setOpened] = useState(false);
  const theme = useAppTheme();
  const item = props.item;
  const onPress = () => {
    if (item.variations.length === 0) {
      if (props.onPress) {
        props.onPress(item);
      }
      return;
    }
    setOpened(!opened);
  };
  const style: StyleProp<ViewStyle> = {};
  if (props.nested) {
    style.borderRadius = 0;
    style.boxShadow = undefined;
  }
  return (
    <ThemedBlock style={style}>
      <Pressable onPress={onPress}>
        <View style={{flexDirection: 'column'}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <ThemedText style={{color: theme.accent}} numberOfLines={1}>{item.name}</ThemedText>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: theme.marginM}}>
            <ThemedImage src={item.images[0]} />
            <View>
              <ThemedText style={{fontWeight: 'bold', flexDirection: 'row', gap: 5}}>
                <ThemedText>Equipment: </ThemedText>
                <ThemedText style={{fontWeight: 'normal', textTransform: 'capitalize'}}>{item.equipment ?? 'None'}</ThemedText>
              </ThemedText>
              <ThemedText style={{fontWeight: 'bold'}}>
                <ThemedText>Primary: </ThemedText>
                {item.muscles.primary.map((muscle, i) => (
                  <Fragment key={i}>
                    {i > 0 && <ThemedText>, </ThemedText>}
                    <ThemedText style={{fontWeight: 'normal', textTransform: 'capitalize'}}>{muscle}</ThemedText>
                  </Fragment>
                ))}
              </ThemedText>
            </View>
          </View>
        </View>
        <View>
          {item.variations.length > 0 && (
              <View style={{flexGrow: 1, flexDirection: 'row-reverse', paddingRight: theme.paddingS}}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
                  <ThemedText style={{color: theme.accent}}>Variations</ThemedText>
                  {!opened && <ThemedIcon size={20} color={theme.accent} name="chevron.down" />}
                  {opened && <ThemedIcon size={20} color={theme.accent} name="chevron.up" />}
                </View>
              </View>
            )}
        </View>
      </Pressable>
      {opened && item.variations && (
        <>
          {item.variations.map((variation, i) => (
            <View key={variation.id}>
                <Separator/>
                <ExerciseBlock onPress={props.onPress} key={variation.id} nested={true} item={{...variation, variations: []}} />
            </View>
          ))}
        </>
      )}
    </ThemedBlock>
  );
};
