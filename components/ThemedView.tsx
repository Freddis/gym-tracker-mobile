import {View, type ViewProps} from 'react-native';
import {useThemeColor} from '@/hooks/useThemeColor';
import {Colors} from '@/types/Colors';

export type ColorType = keyof typeof Colors.light & keyof typeof Colors.dark
export type ThemedViewProps = ViewProps & {
  type?: ColorType
};

export function ThemedView({style, type, ...otherProps}: ThemedViewProps) {
  const selectedType = type ?? 'background';
  const backgroundColor = useThemeColor({}, selectedType);
  return <View style={[{backgroundColor}, style]} {...otherProps} />;
}
