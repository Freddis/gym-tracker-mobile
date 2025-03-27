import {StyleSheet, TextInputProps, TextInput, TextStyle, StyleProp} from 'react-native';
import {useThemeColor} from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({children, ...rest}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const color = useThemeColor({}, 'text');
  const style: StyleProp<TextStyle> = {
    ...styles.default,
    backgroundColor,
    color,
  };
  return (
    <TextInput {...rest} style={style}>{children}</TextInput>
  );
}

const styles = StyleSheet.create({
  default: {
    borderRadius: 5,
    padding: 5,
    height: 40,
    marginBottom: 20,
  },
});
