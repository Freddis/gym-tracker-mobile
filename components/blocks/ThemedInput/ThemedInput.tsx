import {StyleSheet, TextInputProps, TextInput, KeyboardType} from 'react-native';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {FC} from 'react';
import {ColorType} from '../../../hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  type?: ColorType;
  hasError?: boolean
  variant?: 'on-surface'
  keyboardType?: KeyboardType
  selectTextOnFocus?: boolean
};

const getStyles = (theme: Theme, variant?: 'on-surface', hasError?: boolean) => StyleSheet.create({
  default: {
    borderRadius: theme.borderRadiusS,
    padding: theme.paddingS,
    height: 40,
    backgroundColor: variant === 'on-surface' ? theme.background : theme.cavity,
    borderColor: hasError ? theme.dangerText : theme.cavity,
    borderWidth: 1,
    color: variant === 'on-surface' ? theme.text : theme.cavityText,
  },
});

export const ThemedTextInput: FC<ThemedTextInputProps> = (props) => {
  const {children, style, type, ...rest} = props;
  const theme = useAppTheme();
  const styles = getStyles(theme, props.variant, props.hasError);
  return (
    <TextInput {...rest} style={[styles.default, style]}>{children}</TextInput>
  );
};

