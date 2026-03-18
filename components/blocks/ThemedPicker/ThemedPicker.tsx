import {FC} from 'react';
import {StyleSheet} from 'react-native';
import {Picker, PickerProps} from 'react-native-ui-lib';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {Theme} from '../../../types/Colors';

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.cavity,
    padding: theme.paddingS,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadiusS,
    color: theme.cavityText,
    borderColor: theme.cavity,
    fontSize: 20,
    borderWidth: 1,
    marginBottom: theme.marginM,
  },
});

export const ThemedPicker: FC<PickerProps> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
    <Picker {...props} containerStyle={{...styles.container, ...props.containerStyle}} color={props.color ?? theme.cavityText} />
  );
};
