import {StyleSheet, TextInputProps, TextInput} from 'react-native';
import {ColorType} from '../ThemedView/ThemedView';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';

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
  },
});

export function ThemedTextInput({children, style, type, ...rest}: ThemedTextInputProps) {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
    <TextInput {...rest} style={styles.default}>{children}</TextInput>
  );
}

