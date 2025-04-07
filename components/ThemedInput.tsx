import {StyleSheet, TextInputProps, TextInput, TextStyle, StyleProp} from 'react-native';
import {useThemeColor} from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({children,style, ...rest}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const color = useThemeColor({}, 'text');
  const newStyle: StyleProp<TextStyle> = {
    ...styles.default,
    backgroundColor,
    color,
    ...(typeof style === 'object' ? style : {})
  };
  return (
    <TextInput {...rest} style={newStyle}>{children}</TextInput>
  );
}

const styles = StyleSheet.create({
  default: {
    borderRadius: 5,
    padding: 5,
    height: 40,
  },
});
