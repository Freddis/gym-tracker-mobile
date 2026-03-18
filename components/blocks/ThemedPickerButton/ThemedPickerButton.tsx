import {FC} from 'react';
import {ThemedPicker} from '../ThemedPicker/ThemedPicker';
import {PickerProps} from 'react-native-ui-lib';
import {StyleSheet} from 'react-native';
import {Theme} from '../../../types/Colors';
import {useAppTheme} from '../../../hooks/useAppTheme';

const getStyles = (theme: Theme, props: PickerProps) => StyleSheet.create({
  container: {
    width: 'auto',
    height: 'auto',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    marginBottom: 0,
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    height: '100%',
  },
  field: {
    display: 'none',
  },
});

export const ThemedPickerButton: FC<PickerProps & {children: string}> = (props) => {
  const newProps: PickerProps = {
    ...props,
    children: undefined,
  };
  const theme = useAppTheme();
  const styles = getStyles(theme, props);
  return (

      <ThemedPicker
        {...newProps}
        fieldStyle={styles.field}
        label={props.children}
        labelStyle={styles.label}
        containerStyle={styles.container}
        labelColor={theme.accent}
      />

  );
};
