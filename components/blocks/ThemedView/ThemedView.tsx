import {View, type ViewProps} from 'react-native';
import {ColorType, useThemeColor} from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  type?: ColorType
};

export function ThemedView({style, type, ...otherProps}: ThemedViewProps) {
  const selectedType = type ?? 'background';
  const backgroundColor = useThemeColor({}, selectedType);
  return <View style={[{backgroundColor}, style]} {...otherProps} />;
}
