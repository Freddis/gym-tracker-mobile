import { ScrollView, ScrollViewProps} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import {Colors} from '@/types/Colors';

export type ColorType = keyof typeof Colors.light & keyof typeof Colors.dark
export type ThemedViewProps = ScrollViewProps & {
  type?: ColorType
};

export function ThemedScrollView({ style, type, ...otherProps }: ThemedViewProps) {
  const selectedType = type ?? 'background'
  const backgroundColor = useThemeColor({}, selectedType);
  return <ScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
}
