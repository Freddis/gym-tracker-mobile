import {StyleSheet, TextInputProps, TextInput} from 'react-native';
import {ColorType} from '../ThemedView/ThemedView';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {FC} from 'react';

export type ThemedTextInputProps = TextInputProps & {
  type?: ColorType
};

const getStyles = (theme: Theme) => StyleSheet.create({
  default: {
    borderRadius: 5,
    padding: 5,
    height: 40,
    backgroundColor: theme.cavity,
    borderColor: theme.cavity,
    borderWidth: 1,
    color: theme.cavityText,
  },
});

export const ThemedTextInput: FC<ThemedTextInputProps> = (props) => {
  const {children, style, type, ...rest} = props;
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
    <TextInput {...rest} style={[styles.default, style]}>{children}</TextInput>
  );
};

