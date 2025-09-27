import {FC, useState} from 'react';
import {Pressable, StyleSheet, LayoutChangeEvent} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {ThemedView, ThemedViewProps} from '../ThemedView/ThemedView';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedText} from '../ThemedText/ThemedText';
import {Theme} from '@/types/Colors';

export interface SegmentedControlItem {
  value: string;
  label: string;
}
interface ThemedSegmentedControlProps {
  values: SegmentedControlItem[];
  onChange: (item: SegmentedControlItem) => void;
  style?: ThemedViewProps['style'];
}

const styled = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundDeepest,
      padding: 2,
      flexDirection: 'row',
      flexShrink: 1,
      borderRadius: theme.borderRadiusS,
      overflow: 'hidden',
    },
    item: {
      paddingHorizontal: theme.paddingM,
      borderRadius: theme.borderRadiusS - 1,
      fontSize: 15,
      opacity: 0.7,
    },
    itemSelected: {
      opacity: 1,
    },
    thumb: {
      position: 'absolute',
      top: 2,
      bottom: 2,
      backgroundColor: 'white', // fallback; overridden below with theme.surface
      borderRadius: theme.borderRadiusS - 1,
    },
  });

export const ThemedSegmentedControl: FC<ThemedSegmentedControlProps> = (
  props
) => {
  const theme = useAppTheme();
  if (!props.values[0]) {
    throw new Error('ThemedSegmentedControl requires at least one value');
  }

  const [selected, setSelected] = useState<SegmentedControlItem>(
    props.values[0]
  );
  const [itemWidth, setItemWidth] = useState(0);

  const styles = styled(theme);

  const translateX = useSharedValue(0);

  const onItemPress = (item: SegmentedControlItem, index: number) => {
    setSelected(item);
    props.onChange(item);
    translateX.value = withTiming(index * itemWidth, {duration: 200});
  };

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width / props.values.length;
    setItemWidth(width);
  };

  return (
    <ThemedView style={[styles.container, props.style]} onLayout={onLayout}>
      {itemWidth > 0 && (
        <Animated.View
          style={[
            styles.thumb,
            animatedThumbStyle,
            {
              width: itemWidth - 4,
              marginHorizontal: 2,
              backgroundColor: theme.surface,
              zIndex: -1, // 👈 push behind text
            },
          ]}
        />
      )}
      {props.values.map((item, index) => (
        <Pressable
          key={item.value}
          onPress={() => onItemPress(item, index)}
        >
          <ThemedText
            style={[
              styles.item,
              item.value === selected.value ? styles.itemSelected : {},
              {
                color:
                  item.value === selected.value
                    ? theme.surfaceText
                    : theme.text,
              },
            ]}
          >
            {item.label}
          </ThemedText>
        </Pressable>
      ))}
    </ThemedView>
  );
};
