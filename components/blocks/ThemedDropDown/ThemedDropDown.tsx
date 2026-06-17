import {FC} from 'react';
import {
  StyleSheet,
  Pressable,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {ColorType} from '../../../hooks/useThemeColor';

export type ThemedDropDownProps = {
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  disabled?: boolean;
  hasError?: boolean;
  variant?: 'on-surface';
  type?: ColorType;
  style?: StyleProp<ViewStyle>;
};

const getStyles = (
  theme: Theme,
  variant?: 'on-surface',
  hasError?: boolean,
) =>
  StyleSheet.create({
    container: {
      borderRadius: theme.borderRadiusS,
      padding: theme.paddingS,
      backgroundColor:
        variant === 'on-surface'
          ? theme.background
          : theme.cavity,
      borderColor: hasError ? theme.dangerText : theme.cavity,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      flex: 1,
      color:
        variant === 'on-surface'
          ? theme.text
          : theme.cavityText,
    },
    placeholder: {
      flex: 1,
      color:
        variant === 'on-surface'
          ? `${theme.text}80`
          : `${theme.cavityText}80`,
    },
  });

export const ThemedDropDown: FC<ThemedDropDownProps> = ({
  value,
  placeholder = 'Select',
  style,
  onPress,
  hasError,
  variant,
  disabled,
}) => {
  const theme = useAppTheme();
  const styles = getStyles(theme, variant, hasError);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.container, style]}>
      <Text
        numberOfLines={1}
        style={value ? styles.text : styles.placeholder}>
        {value || placeholder}
      </Text>

      <Ionicons
        name="chevron-down"
        size={18}
        color={
          variant === 'on-surface'
            ? theme.text
            : theme.cavityText
        }
      />
    </Pressable>
  );
};
