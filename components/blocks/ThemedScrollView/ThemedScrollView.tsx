import {ScrollView, ScrollViewProps} from 'react-native';
import {useThemeColor} from '@/hooks/useThemeColor';
import {Colors} from '@/types/Colors';
import {forwardRef, Ref} from 'react';

export type ColorType = keyof typeof Colors.light & keyof typeof Colors.dark
export type ThemedViewProps = ScrollViewProps & {
  type?: ColorType
};

export const ThemedScrollView = forwardRef(
  function ThemedScrollViewBase({style, type, ...otherProps}: ThemedViewProps, ref: Ref<ScrollView>) {
    const selectedType = type ?? 'background';
    const backgroundColor = useThemeColor({}, selectedType);
    return <ScrollView ref={ref} style={[{backgroundColor}, style]} {...otherProps} />;
  }
);
