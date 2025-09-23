import {FC, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {ThemedView, ThemedViewProps} from '../ThemedView/ThemedView';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedText} from '../ThemedText/ThemedText';
import {Theme} from '@/types/Colors';

export interface SegmentedControlItem {value: string; label: string}
interface ThemedSegmentedControlProps {
  values: SegmentedControlItem[];
  onChange: (item: SegmentedControlItem) => void;
  style?: ThemedViewProps['style']
}

const styled = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor:
    theme.backgroundDeepest,
    padding: 2,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 5,
    borderRadius: 5,
  },
  item: {
    paddingHorizontal: 5,
    borderRadius: 4,
    fontSize: 15,
    opacity: 0.7,
  },
  itemSelected: {
    backgroundColor: theme.surface,
    color: theme.surfaceText,
    opacity: 1,
  },
});

export const ThemedSegmentedControl: FC<ThemedSegmentedControlProps> = (props) => {
  const theme = useAppTheme();
  if (!props.values[0]) {
    throw new Error('ThemedSegmentedControl requires at least one value');
  }
  const [selected, setSelected] = useState<SegmentedControlItem>(props.values[0]);
  const styles = styled(theme);
  const onItemPress = (item: SegmentedControlItem) => {
    setSelected(item);
    props.onChange(item);
  };
  return (
    <ThemedView style={[styles.container, props.style]}>
      {props.values.map((item) => (
        <Pressable key={item.value} onPress={onItemPress.bind(null, item)}>
          <ThemedText
            style={[styles.item, item.value === selected.value ? styles.itemSelected : {}]}
            key={item.value}
          >
            {item.label}
          </ThemedText>
        </Pressable>
      ))}
    </ThemedView>
  );
};
