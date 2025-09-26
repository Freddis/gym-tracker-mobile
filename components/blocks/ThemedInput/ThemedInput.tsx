import {StyleSheet, TextInputProps, TextInput} from 'react-native';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {FC} from 'react';
import {ColorType} from '../../../hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  type?: ColorType
};

const getStyles = (theme: Theme) => StyleSheet.create({
  default: {
    borderRadius: theme.borderRadiusS,
    padding: theme.paddingS,
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

