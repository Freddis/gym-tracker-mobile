import {StyleSheet, TextInputProps, TextInput, TextStyle, StyleProp} from 'react-native';
import {useThemeColor} from '@/hooks/useThemeColor';
import {ColorType} from './ThemedView';

export type ThemedTextInputProps = TextInputProps & {
  type?: ColorType
};

export function ThemedTextInput({children, style, type, ...rest}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({}, type ?? 'backgroundSecondary');
  const color = useThemeColor({}, 'text');
  const newStyle: StyleProp<TextStyle> = {
    ...styles.default,
    backgroundColor,
    borderColor: backgroundColor,
    color,
    ...(typeof style === 'object' ? style : {}),
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
