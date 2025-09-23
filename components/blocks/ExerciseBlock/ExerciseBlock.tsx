import {FC, useState} from 'react';
import {Pressable, View} from 'react-native';
import {ThemedText} from '../ThemedText/ThemedText';
import {ExerciseBlockProps} from './types/ExerciseBlockProps';
import {ThemedIcon} from '../ThemedIcon/ThemedIcon';
import {ThemedBlock} from '../ThemedBlock/ThemedBlock';
import {ThemedImage} from '../ThemedImage/ThemedImage';
import {useAppTheme} from '@/hooks/useAppTheme';

export const ExerciseBlock: FC<ExerciseBlockProps> = (props) => {
  const [opened, setOpened] = useState(false);
  const theme = useAppTheme();
  const item = props.item;
  const onPress = () => {
    if (!item.variations) {
      if (props.onPress) {
        props.onPress(item);
      }
      return;
    }
    setOpened(!opened);
  };
  return (
    <ThemedBlock style={{borderRadius: props.nested ? 0 : 10}}>
      <Pressable onPress={onPress}>
        <View style={{flexDirection: 'column'}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <ThemedText style={{color: theme.accent}}>{item.name}</ThemedText>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10}}>
            <ThemedImage src={item.images[0]} />
            <View>
              <ThemedText style={{fontWeight: 'bold'}}>
                <>Equipment: </>
                <ThemedText style={{fontWeight: 'normal', textTransform: 'capitalize'}}>{item.equipment ?? 'None'}</ThemedText>
              </ThemedText>
              <ThemedText style={{fontWeight: 'bold'}}>
                <>Primary: </>
                <ThemedText style={{fontWeight: 'normal', textTransform: 'capitalize'}}>Trapezius</ThemedText>
              </ThemedText>
            </View>
          </View>
        </View>
      <View>
        {item.variations && (
            <View style={{flexGrow: 1, flexDirection: 'row-reverse', paddingRight: 5}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
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
            <View>
                <View style={{borderBottomColor: theme.surfaceText, opacity: 0.1, marginTop: 5, borderBottomWidth: 1}} />
                <ExerciseBlock onPress={props.onPress} key={variation.id} nested={true} item={variation} />
            </View>
          ))}
        </>
      )}
    </ThemedBlock>
  );
};
