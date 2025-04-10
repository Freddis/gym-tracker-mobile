import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import {Colors} from '@/types/Colors';

export type ColorType = keyof typeof Colors.light & keyof typeof Colors.dark
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ColorType
};

export function ThemedView({ style, type, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const selectedType = type ?? 'background'
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, selectedType);
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
