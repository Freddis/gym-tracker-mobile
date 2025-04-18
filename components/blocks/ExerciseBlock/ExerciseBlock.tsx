import {FC, useState} from 'react';
import {StyleProp, ImageStyle, Pressable, View, Image} from 'react-native';
import {ThemedText} from '../ThemedText/ThemedText';
import {ColorType, ThemedView} from '../ThemedView/ThemedView';
import {ExerciseBlockProps} from './types/ExerciseBlockProps';
import {ThemedIcon} from '../ThemedIcon/ThemedIcon';

export const ExerciseBlock: FC<ExerciseBlockProps> = (props) => {
  const [opened, setOpened] = useState(false);
  const imgStyle: StyleProp<ImageStyle> = {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'white',
    paddingLeft: 0,
    objectFit: 'cover',
  };
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
  const colorType: ColorType = props.nested ? 'backgroundDeepest' : 'background';

  return (
    <ThemedView type={colorType} style={{paddingHorizontal: props.nested ? 10 : 0, paddingVertical: 0}}>
      <Pressable onPress={onPress}>
        <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}}>
          <Image style={imgStyle} src={item.images[0]} />
          <ThemedText style={{fontSize: 14, padding: 15}}>{item.name}</ThemedText>
          {item.variations && (
            <View style={{flexGrow: 1, flexDirection: 'row-reverse', paddingRight: 5}}>
              <ThemedIcon size={20} name="chevron.down" />
            </View>
          )}
        </View>
      </Pressable>
      {opened && item.variations && (
        <ThemedView type={'backgroundDeepest'} style={{paddingLeft: 10, paddingTop: 10}}>
          {item.variations.map((variation) => (
                <ExerciseBlock key={variation.id} nested={true} item={variation} />
              ))}
        </ThemedView>
      )}
    </ThemedView>
  );
};
